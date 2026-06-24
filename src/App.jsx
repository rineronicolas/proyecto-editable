import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Overlay from './components/Overlay'
import BlenderModel from './components/BlenderModel'
import ProgressBar from './components/ProgressBar'

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(min, max, value) {
  const x = clamp01((value - min) / (max - min))
  return x * x * (3 - 2 * x)
}

function lerp(start, end, amount) {
  return start + (end - start) * amount
}

function SmokeBackground({ progress }) {
  const videoRef = useRef()
  const currentTimeRef = useRef(-1)
  const [fallbackGif, setFallbackGif] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [useCanvas, setUseCanvas] = useState(false)
  const sequenceProgress = clamp01(progress / 0.88)

  useEffect(() => {
    if (fallbackGif) return
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return

    const nextTime = video.duration * sequenceProgress
    if (Math.abs(nextTime - currentTimeRef.current) < 1 / 30) return

    currentTimeRef.current = nextTime
    video.pause()
    video.currentTime = nextTime
  }, [sequenceProgress, fallbackGif])
  useEffect(() => {
    if (videoLoaded) setUseCanvas(false)
  }, [videoLoaded])

  useEffect(() => {
    if (videoError) setUseCanvas(true)
  }, [videoError])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded) setUseCanvas(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  if (useCanvas || fallbackGif) {
    return <SmokeCanvas progress={progress} />
  }

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      loop
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        opacity: 0.6,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
      onLoadedMetadata={event => {
        setVideoLoaded(true)
        event.currentTarget.pause()
        if (Number.isFinite(event.currentTarget.duration)) {
          event.currentTarget.currentTime = event.currentTarget.duration * sequenceProgress
        }
      }}
      onError={() => setFallbackGif(true) || setVideoError(true)}
    >
      <source src="/smoke.mp4" type="video/mp4" />
      <source src="/smoke.webm" type="video/webm" />
    </video>
  )
}

function SmokeCanvas({ progress }) {
  const ref = useRef()
  const progressRef = useRef(progress)
  useEffect(() => { progressRef.current = progress }, [progress])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    let raf = null
    const dpr = Math.max(1, window.devicePixelRatio || 1)

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Optimized hash-based noise (low-complexity, deterministic, seamless)
    function fxHash(x, y, t) {
      let h = Math.sin(x * 0.1 + y * 0.05 + t * 0.03) * 12345.6789
      return h - Math.floor(h)
    }

    // Interpolation for smooth gradients
    function smoothstep(t) {
      return t * t * (3 - 2 * t)
    }

    // Efficient Perlin-like 2D + time noise
    function fbm(x, y, t) {
      let v = 0, a = 0.5
      for (let i = 0; i < 2; i++) {
        const freq = 1 << i
        v += a * (fxHash(x * freq * 0.01, y * freq * 0.01, t) * 2 - 1)
        a *= 0.5
      }
      return (v + 1) * 0.5
    }

    function draw() {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      const t = (progressRef.current % 1) * 10 // 10 second loop equivalence

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      // Background: deep gray
      ctx.fillStyle = 'rgba(20,20,22,1)'
      ctx.fillRect(0, 0, w, h)

      // Base smoke layer: smooth gradient background
      ctx.filter = 'blur(40px)'
      const baseGrad = ctx.createLinearGradient(0, h, w * 0.5, 0)
      baseGrad.addColorStop(0, 'rgba(60,60,65,0.15)')
      baseGrad.addColorStop(0.5, 'rgba(90,90,95,0.08)')
      baseGrad.addColorStop(1, 'rgba(40,40,45,0.04)')
      ctx.fillStyle = baseGrad
      ctx.fillRect(0, 0, w, h)

      // Organic plume shapes (low-complexity, high spatial consistency)
      ctx.filter = 'blur(30px)'
      ctx.globalCompositeOperation = 'lighter'
      const plumes = 3
      for (let p = 0; p < plumes; p++) {
        const phaseMult = 1 + p * 0.3
        const xOffset = w * (0.25 + p * 0.25)
        const yOffset = h * (0.3 + fxHash(p, p, 0) * 0.2)
        const wavePhase = t * 0.4 * phaseMult + p * 2.09

        for (let i = 0; i < 6; i++) {
          const py = yOffset + (i * h * 0.12)
          const noiseVal = fbm(p, i, t * 0.2 * phaseMult)
          const xWave = Math.sin(wavePhase + i * 1.047) * (50 + noiseVal * 30)
          const px = xOffset + xWave
          const radius = 80 + noiseVal * 60
          const alpha = 0.08 * (1 - i * 0.1)
          const gray = 120 + noiseVal * 40

          const grad = ctx.createRadialGradient(px, py, 0, px, py, radius)
          grad.addColorStop(0, `rgba(${gray},${gray},${gray+5},${alpha})`)
          grad.addColorStop(0.5, `rgba(${gray-20},${gray-20},${gray-15},${alpha * 0.4})`)
          grad.addColorStop(1, `rgba(40,40,45,0)`)

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.ellipse(px, py, radius, radius * 0.7, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Subtle mid-tone accents for detail and consistency
      ctx.filter = 'blur(12px)'
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = 0.6
      for (let i = 0; i < 4; i++) {
        const ix = i * w * 0.25
        const iy = h * (0.4 + Math.sin(t * 0.15 + i) * 0.15)
        const size = 200 + Math.sin(t * 0.1 + i * 1.5) * 80
        const midGray = 80 + (fbm(i, i, t) * 30)
        const accGrad = ctx.createRadialGradient(ix, iy, 0, ix, iy, size)
        accGrad.addColorStop(0, `rgba(${midGray},${midGray},${midGray},0.1)`)
        accGrad.addColorStop(1, `rgba(40,40,45,0)`)
        ctx.fillStyle = accGrad
        ctx.fillRect(ix - size, iy - size, size * 2, size * 2)
      }

      ctx.filter = 'none'
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.8,
        mixBlendMode: 'lighten',
      }}
    />
  )
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const targetScrollProgress = useRef(0)
  const cutawayTakeover = smoothstep(0.88, 0.98, scrollProgress)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
      targetScrollProgress.current = clamp01(progress)
    }

    let animationFrame
    const animateScrollProgress = () => {
      setScrollProgress(current => {
        const next = lerp(current, targetScrollProgress.current, 0.14)
        return Math.abs(next - targetScrollProgress.current) < 0.0005
          ? targetScrollProgress.current
          : next
      })
      animationFrame = window.requestAnimationFrame(animateScrollProgress)
    }

    handleScroll()
    animationFrame = window.requestAnimationFrame(animateScrollProgress)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        opacity: 1 - cutawayTakeover,
        transition: 'opacity 0.2s linear',
        overflow: 'hidden',
        display: 'none', // Hide 3D model
      }}>
        {/* DESVANECER EL HUMO Y SUS DEGRADADOS EN LAS SECCIONES OSCURAS */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: scrollProgress > 0.35 ? 0 : 1, 
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none'
        }}>
          <SmokeBackground progress={scrollProgress} />
        </div>

        <Canvas
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
          camera={{ position: [0, 14, 42], fov: 35 }}
          gl={{ antialias: true, localClippingEnabled: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[15, 20, 15]} intensity={1.0} />
          <directionalLight position={[-10, 10, 20]} intensity={0.6} />
          <BlenderModel scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        opacity: cutawayTakeover,
        transform: `scale(${1 + cutawayTakeover * 0.02})`,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: 'none',
        background: 'var(--bg)',
      }} />

      <ProgressBar progress={scrollProgress} />
      <Overlay scrollProgress={scrollProgress} />
    </>
  )
}
// Inyección de estilos de emergencia para centrar la sección de Caterpillar hoy
// SOLUCIÓN ESTABLE Y SEGURA PARA LA ENTREGA
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
    #seccion-cta {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      text-align: center !important;
      min-height: 100vh !important;
      padding: 0 10vw !important;
    }
    #seccion-cta p { text-align: center !important; margin: 1.2rem auto 0 !important; }
    #seccion-cta button { margin: 2.5rem auto 0 !important; display: block !important; }
    
   /* El botón de la Tapa un poquito más abajo para que no se encime con nada */
    .cutaway-left-controls {
      top: 60px !important;
    }

    /* EL PARCHE REAL: Forzamos a que la barra se quede fija arriba de todo y NO flote al bajar */
    nav {
nav {
      position: absolute !important; 
      top: 0 !important;
      pointer-events: auto !important;
    }

    #seccion-hero-combinado, #seccion-hero-image, main > div:first-child, main > section:first-of-type {
      opacity: 1 !important; transform: none !important; filter: none !important; background: #ffffff !important;
    }
    #seccion-hero-image { margin-top: -2px !important; }

    /* ESTILOS DEL BOTÓN FLOTANTE (Identidad Caterpillar) */
    .btn-volver-arriba {
      position: fixed !important;
      bottom: 30px !important;
      right: 30px !important;
      width: 50px !important;
      height: 50px !important;
      background-color: #ffcc00 !important;
      color: #000000 !important;
      border: 2px solid #000000 !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 24px !important;
      font-weight: bold !important;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3) !important;
      z-index: 99999 !important;
      transition: opacity 0.3s ease, transform 0.2s ease !important;
      opacity: 0;
      pointer-events: none;
    }

    .btn-volver-arriba.visible {
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    .btn-volver-arriba:hover {
      transform: scale(1.1) !important;
      background-color: #e6b800 !important;
    }
      #scroll-top-btn {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `
  document.head.appendChild(style)

  if (!document.getElementById('scroll-top-btn')) {
    const btn = document.createElement('button')
    btn.id = 'scroll-top-btn'
    btn.className = 'btn-volver-arriba'
    btn.innerHTML = '↑'
    document.body.appendChild(btn)

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible')
      } else {
        btn.classList.remove('visible')
      }
    })
  }
}

if (typeof window !== 'undefined') {
  document.body.addEventListener('click', (e) => {
    // Detecta el clic en la esquina inferior derecha donde está el botón CAT
    if (e.clientX > window.innerWidth - 90 && e.clientY > window.innerHeight - 90) {
      
      const inicio = window.scrollY;
      const tiempoTotal = 2300; // 1300 milisegundos = 1.3 segundos de subida suave
      let tiempoInicio = null;

      function animacionScroll(tiempoActual) {
        if (tiempoInicio === null) tiempoInicio = tiempoActual;
        const progreso = tiempoActual - tiempoInicio;
        
        // Easing cuadratizado: arranca con fuerza y frena con mucha sutileza arriba
        const progresoSuave = progreso / tiempoTotal;
        const avance = inicio * (1 - (progresoSuave * (2 - progresoSuave)));

        window.scrollTo(0, avance);

        if (progreso < tiempoTotal) {
          requestAnimationFrame(animacionScroll);
        } else {
          window.scrollTo(0, 0); // Asegura el cero absoluto al final
        }
      }

      requestAnimationFrame(animacionScroll);
    }
  });
}
