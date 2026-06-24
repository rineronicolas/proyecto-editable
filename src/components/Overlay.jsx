import { useRef, useEffect, useState } from 'react'
import VasoImg from '/VASOSOLO.png';

const handleRacingMouseEnter = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const relativeY = e.clientY - rect.top
  const isComingFromTop = relativeY < rect.height / 2

  if (isComingFromTop) {
    // Si entra por arriba, arranca oculta arriba (recorta desde abajo hacia arriba)
    e.currentTarget.style.setProperty('--racing-clip', 'inset(0 0 100% 0)')
  } else {
    // Si entra por abajo, arranca oculta abajo (recorta desde arriba hacia abajo)
    e.currentTarget.style.setProperty('--racing-clip', 'inset(100% 0 0 0)')
  }

  e.currentTarget.classList.add('hovered')
}
const handleRacingMouseLeave = (e) => {
  e.currentTarget.classList.remove('hovered')
}
/* ─── Section data (matching the real model) ───────── */
const sections = [
  {
    id: 'hero',
    anchor: 'seccion-producto',
    tag: 'BATIDORA MANUAL CAT',
    title: 'BATI-DORA',
    subtitle: 'Diseño Industrial',
    desc: 'Diseño profesional. Cada componente pensado para el máximo rendimiento',
    align: 'center',
    image: '/dosfotos.jpg',
  },
  {
  id: 'hero-image',
  anchor: 'seccion-hero-image',
  tag: '',
  title: '',
  subtitle: '',
  desc: '',
  align: 'center',
  image: '',
  whiteSection: false, // CAMBIÁ ESTO A FALSE
},
  {
    id: 'body',
    anchor: 'seccion-despiece',
    tag: '01 — ESTRUCTURA',
    title: 'CARCASA',
    subtitle: 'Cuerpo principal',
    desc: 'Carcasa base con grip ergonómico negro. Carrier interno que aloja el sistema de transmisión con precisión milimétrica.',
    align: 'left',
  },
  {
    id: 'gears',
    tag: '02 — TRANSMISIÓN',
    title: 'ENGRANAJES',
    subtitle: 'Sistema planetario',
    desc: 'Eje solar con tres engranajes planetarios (izquierdo, derecho y posterior). Rotación sincronizada que multiplica la fuerza de batido.',
    align: 'right',
  },
  {
    id: 'blade',
    tag: '03 — DESPIECE COMPLETO',
    title: 'CUCHILLA',
    subtitle: 'Acero inoxidable',
    desc: 'Sistema de corte con buje, cojinete, arandela y o-ring de sellado. Inserto roscado y acople para fijación precisa sin herramientas.',
    align: 'left',
  },
  {
    id: 'explode',
    tag: '04 — CONTENEDOR',
    title: 'VASO',
    subtitle: 'Hermetismo asegurado',
    desc: 'Cero filtraciones, gracias al buje interno que asegura el hermetismo dentro del vaso.',
    align: 'right',
    features: [],
  },
  {
    id: 'materials',
    tag: '05 — MATERIALES',
    title: 'CALIDAD',
    subtitle: 'Materiales premium',
    desc: 'Cada material elegido por su excelencia para cada función.',
    align: 'left',
    features: ['Acrílico claro', 'Nylon 6-6', 'Acero inoxidable', 'Cobre pulido', 'Latón mate', 'Caucho suave'],
  },
  {
    id: 'cta',
    tag: '',
    title: 'CATERPILLAR',
    subtitle: 'Diseño Industrial',
    desc: 'Descubrí todos los detalles técnicos y especificaciones del producto.',
    align: 'center',
    cta: true,
  },
]

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(min, max, value) {
  const x = clamp01((value - min) / (max - min))
  return x * x * (3 - 2 * x)
}

const cutawayParts = [
  {
    id: 'body-shell',
    label: 'Tapa',
    kicker: 'Tapa superior',
    desc: 'Tapa superior con cierre hermético, diseñada para mantener la mezcla segura y aislada durante el batido.',
    image: '/corte-final-batidora.png',
    hotspot: { left: '53%', top: '21%' },
    crop: { x: '50%', y: '34%', scale: 2.25 },
  },
  {
    id: 'gear-set',
    label: 'Vaso',
    kicker: 'Contenedor acrílico',
    desc: 'Pieza transparente que permite ver el proceso de mezcla y guía el flujo del alimento hacia la cuchilla.',
    image: '/despiece-engranajes.jpeg',
    hotspot: { left: '53%', top: '46%' },
    crop: { x: '50%', y: '50%', scale: 2.8 },
    detailMode: 'contain',
  },
  {
    id: 'jar',
    label: 'Cuchilla',
    kicker: 'Sistema de corte',
    desc: 'Conjunto inferior con cuchilla, eje, bujes, sellos y acople. Es el nodo que transmite el giro hacia el vaso.',
    image: '/corte-final-batidora.png',
    hotspot: { left: '53%', top: '64%' },
    crop: { x: '50%', y: '60%', scale: 2.2 },
  },
  {
    id: 'blade-assembly',
    label: 'Engranajes',
    kicker: 'Transmisión interna',
    desc: 'Sistema de engranajes que reparte el movimiento desde el eje central hacia el conjunto inferior de batido.',
    image: '/despiece-cuchilla.png',
    hotspot: { left: '53%', top: '86%' },
    crop: { x: '50%', y: '72%', scale: 2.7 },
  },
]

/* ─── Animated section ──────────────────────────────── */
function Section({ data, scrollProgress, transitionProgress, heroTransition, scrollToAnchor, focusCutawayPart, setBodyProgress, bodyProgress }) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [hoveredMaterial, setHoveredMaterial] = useState(null);

  useEffect(() => {
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20)
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) setVisible(true)
      const p = entry.intersectionRatio
      const local = smoothstep(0.05, 0.9, p)
      setProgress(local)
      if (data.id === 'body' && typeof setBodyProgress === 'function') {
        const smooth = smoothstep(0.15, 0.85, p)
        setBodyProgress(smooth)
      }
    }, { threshold: thresholds })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [data.id, setBodyProgress])

  useEffect(() => {
    let timer = null
    if (pulse) {
      timer = window.setTimeout(() => setPulse(false), 650)
    }
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [pulse])

  const isHero = data.id === 'hero'
  const isCta = data.cta
  const isWhiteSection = data.whiteSection

  // compute CTA color interpolation if a transition progress is supplied
  const t = transitionProgress ?? 0
  function mix(a, b, p) { return Math.round(a * (1 - p) + b * p) }
  const whiteRGB = [240, 237, 232]
  const mutedRGB = [170, 170, 170]
  const descRGB = [153, 153, 153]
  const blackRGB = [0, 0, 0]
  const yellowRGB = [255, 205, 0]
  const titleColor = `rgb(${mix(whiteRGB[0], blackRGB[0], t)}, ${mix(whiteRGB[1], blackRGB[1], t)}, ${mix(whiteRGB[2], blackRGB[2], t)})`
  const subtitleColor = `rgb(${mix(mutedRGB[0], blackRGB[0], t)}, ${mix(mutedRGB[1], blackRGB[1], t)}, ${mix(mutedRGB[2], blackRGB[2], t)})`
  const descColor = `rgb(${mix(descRGB[0], blackRGB[0], t)}, ${mix(descRGB[1], blackRGB[1], t)}, ${mix(descRGB[2], blackRGB[2], t)})`
  const buttonBg = `rgb(${mix(yellowRGB[0], blackRGB[0], t)}, ${mix(yellowRGB[1], blackRGB[1], t)}, ${mix(yellowRGB[2], blackRGB[2], t)})`
  const buttonColor = `rgb(${mix(blackRGB[0], yellowRGB[0], t)}, ${mix(blackRGB[1], yellowRGB[1], t)}, ${mix(blackRGB[2], yellowRGB[2], t)})`

  const alignment =
    data.align === 'center' ? { textAlign: 'center', alignItems: 'center' } :
    data.align === 'right'  ? { textAlign: 'right',  alignItems: 'flex-end' } :
                              { textAlign: 'left',   alignItems: 'flex-start' }

  const baseDy = (1 - progress) * 20
  const baseTransform = isCta ? 'translateY(0)' : `translateY(${baseDy}px)`
  let transformValue = baseTransform
  if (data.id === 'body') {
    const p = bodyProgress ?? 0
    const dy = (1 - p) * 18
    const scaleY = 1 + p * 0.18
    transformValue = `translateY(${dy}px) scaleY(${scaleY})`
  }

  return (
    <section
      id={data.anchor || `seccion-${data.id}`}
      ref={ref}
      style={{
        minHeight: isWhiteSection ? (data.id === 'hero-image' ? '100vh' : 'min(72vh, 68rem)') : '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isHero ? 'center' : 'flex-start',
        padding: isHero ? '0 8vw' : '3rem 10vw 0',
        position: 'relative',
        zIndex: data.id === 'body' ? 3 : 2,
        opacity: isCta ? 1 : progress,
        transformOrigin: data.id === 'body' ? 'top center' : undefined,
        transform: transformValue,
        transition: isCta ? 'background 220ms linear' : undefined,
        background: (isHero) ? 'transparent' : (isWhiteSection ? '#fff' : (data.id === 'body' ? `rgba(6,6,9,${bodyProgress ?? 0})` : undefined)),
        color: isHero || isWhiteSection ? '#060609' : (data.id === 'body' && (bodyProgress ?? 0) > 0.45 ? '#f0ede8' : undefined),
        borderBottom: isHero || isWhiteSection ? '1px solid rgba(0, 0, 0, 0.08)' : undefined,
        ...alignment,
      }}
    >
   {data.id === 'hero-image' && (
  <>
  {/* Imagen 1: RENDERENTERO.png */}
    <div style={{
      position: 'absolute',
      top: '62%',           // Controla la posición vertical del Render
      left: '55%',          // Controla la posición horizontal del Render
      transform: 'translate(-50%, -50%)',
      width: '300px',       // Cambia el tamaño base
      scale: '1.8',           // Usa 'scale' para agrandar o achicar (ej: 1.2 o 0.8)
      zIndex: 999,
      pointerEvents: 'none'
    }}>
      <img src="/RENDER1.PNG" alt="Render" style={{ width: '100%', height: 'auto' }} />
    </div>
    {/* VISOR 3D INTERACTIVO - MOVIDO AL HERO */}
{data.id === 'hero-image' && (
  <div style={{
    position: 'absolute',
    right: '56vw',  // Ajustá esto para moverlo a izquierda o derecha
    top: '52%',
    transform: 'translateY(-50%)',
    width: '840px',
    height: '840px',
    zIndex: 9999,
    pointerEvents: 'auto'
  }}>
    <model-viewer 
      src="/animacion batidora.glb" 
      auto-rotate 
      camera-controls 
      disable-zoom 
      interaction-prompt="none"
      style={{ width: '100%', height: '100%', backgroundColor: 'transparent', outline: 'none' }}
    />
  </div>
)}
    {/* Imagen 1: RENDER2.png */}
    <div style={{
      position: 'absolute',
      top: '62%',           // Controla la posición vertical del Render
      left: '73%',          // Controla la posición horizontal del Render
      transform: 'translate(-50%, -50%)',
      width: '300px',       // Cambia el tamaño base
      scale: '1.8',           // Usa 'scale' para agrandar o achicar (ej: 1.2 o 0.8)
      zIndex: 999,
      pointerEvents: 'none'
    }}>
      <img src="/RENDER2.PNG" alt="Render" style={{ width: '100%', height: 'auto' }} />
    </div>

    {/* Imagen 2: DESPIECE1.png */}
    <div style={{
      position: 'absolute',
      bottom: '30%',        // Controla la posición vertical del Despiece (desde abajo)
      right: '25%',         // Controla la posición horizontal del Despiece (desde la derecha)
      transform: 'translateX(50%)',
      width: '350px',       // Cambia el tamaño base
      scale: '2.2',         // Usa 'scale' para ajustar el tamaño final
      zIndex: 999,
      pointerEvents: 'none'
    }}>
      <img src="/DESPIECE1.png" alt="Despiece" style={{ width: '100%', height: 'auto' }} />
    </div>
  </>
  
  
)}
{/* RENDER FLOTANTE DEL GANCHO A LA IZQUIERDA - AJUSTADO */}
      {data.id === 'cta' && (
        <div style={{
          position: 'absolute',
          left: '0px',
          top: '50%',
          width: '555px',
          height: 'auto',
          zIndex: 99999, // Al frente de todo
          pointerEvents: 'none',
          transformOrigin: 'left center',
          transform: 'translateY(-50%) rotate(0deg)'
        }}>
          <img 
            src="/GANCHO.png" 
            alt="Detalle Gancho Caterpillar" 
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              zIndex: 99999
            }}
          />
        </div>
      )}
{data.id === 'explode' && (
  <div style={{
    position: 'absolute',
    left: '8vw',
    top: '52%',
    transform: 'translateY(-50%)',
    width: '580px',
    height: 'auto',
    zIndex: 99999,
    pointerEvents: 'none'
  }}>
    <img 
      src="/VASOSOLO.png" 
      alt="Vaso" 
      style={{ 
        width: '170%', 
        height: 'auto', 
        objectFit: 'contain', 
        display: 'block',
        position: 'relative',
        zIndex: 99999,
        top: '-30px',
        left: '-80px'
      }} 
    />
  </div>
)}
      
{/* RENDER FLOTANTE EN LA PANTALLA AMARILLA */}
{data.id === 'cta' && (
  <div style={{
    position: 'absolute',
    right: '0px', // Ajustá esta posición para que quede en el círculo amarillo
    top: '50.2%',
    transform: 'translateY(-50%)',
    width: '535px', // Ajustá el tamaño a tu gusto
    zIndex: 9999
  }}>
    <img src="/2.jpeg" alt="Batidora Render" style={{ width: '100%', height: 'auto' }} />
  </div>
)}
      {/* RENDER FLOTANTE DEL CORTE FINAL - ALINEADO A LA IZQUIERDA */}
      {data.id === 'explode' && (
        <div style={{
          position: 'absolute',
          left: '15vw',             // 👈 Alineado a la izquierda porque el texto está a la derecha
          top: '50%',              
          transform: 'translateY(-40%)',
          width: '300px',          // Un toque más ancho para que se luzca el despiece completo
          height: 'auto',
          zIndex: 99999,           
          pointerEvents: 'none'
        }}>
        <video
            src="/video.webm"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '800px',
              display: 'block',
              margin: '0 auto',
              borderRadius: '12px'
            }}
          />
        </div>
      )}
      {/* RENDER FLOTANTE DE LA CUCHILLA - ALINEADO A LA DERECHA */}
      {data.id === 'blade' && (
        <div style={{
          position: 'absolute',
          right: '22vw',            // Mantiene la misma alineación que la carcasa
          top: '45%',              // Mismo eje de altura para que quede simétrico
          transform: 'translateY(-40%)',
          width: '180px',          // Mismo tamaño que los renders anteriores
          height: 'auto',
          zIndex: 99999,           // Al frente de todo
          pointerEvents: 'none'
        }}>
          <img 
            src="/cuchillas1.png" // 👈 Asegurate de escribirlo igual en tu carpeta public (fíjate si va en minúsculas)
            alt="Sistema de Cuchilla Caterpillar" 
            style={{
              width: '650%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              zIndex: 99999,
              left: '-550px', 
              top: '-50px'
            }}
          />
        </div>
      )}
{/* RENDER FLOTANTE DE LA CARCASA - SOLUCIÓN PNG */}
      {data.id === 'body' && (
        <div style={{
          position: 'absolute',
          right: '8vw',            
          top: '40%',              
          transform: 'translateY(-40%)',
          width: '660px',          
          height: 'auto',
          zIndex: 99999,           
          pointerEvents: 'none'
        }}>
          <img 
            src="/CARCASA1.png" // 👈 Ahora sí coincide perfectamente con tu archivo de la carpeta public
            alt="Carcasa Base Caterpillar" 
            style={{
              width: '120%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              zIndex: 99999,
              top: '-80px',
              left: '-110px' 
            }}
          />
        </div>
      )}
      {/* RENDER GIGANTE DE ENGRANAJES - AL FRENTE DE TODO */}
      {data.id === 'gears' && (
        <div style={{
          position: 'absolute',
          left: '8vw',
          top: '52%',
          transform: 'translateY(-50%)',
          width: '580px',
          height: 'auto',
          zIndex: 99999, // Al frente de todo
          pointerEvents: 'none'
        }}>
          <img 
            src="/ENGRANAJES.png" 
            alt="Sistema Planetario de Engranajes" 
            style={{
              width: '120%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              zIndex: 99999,
              top: '-100px',
              left: '90px'
            }}
            
          />
        </div>
      )}
      {/* Tag */}
      {data.tag ? (
        <span style={{
          fontSize: '1rem',
          letterSpacing: '0.35em',
          color: '#ffcc00',
          fontWeight: 500,
          marginBottom: '1rem',
          display: 'block',
          marginTop: data.id === 'materials' ? '80px' : (data.id === 'gears' || data.id === 'body' || data.id === 'blade' || data.id === 'explode') ? '140px' : '0px',
          transition: 'margin-top 0.3s ease'
        }}>
          {data.tag}
        </span>
      ) : null}

      {/* Title */}
      {data.title ? (
        <h2 style={{
          fontSize: isHero ? 'clamp(3.5rem, 12vw, 9rem)' : 'clamp(2.2rem, 5vw, 4.6rem)',
          fontWeight: 800,
          lineHeight: isHero ? 0.95 : 1.25,
          letterSpacing: isHero ? '-0.04em' : '-0.03em',
          margin: 0,
          paddingBottom: isHero ? 0 : '0.12em',
          background: 'none',
          WebkitBackgroundClip: 'border-box',
          WebkitTextFillColor: 'initial',
          color: isCta ? '#000' : (isHero ? '#060609' : (isWhiteSection ? '#060609' : '#f0ede8')),
          opacity: isCta ? 1 : progress,
          transform: isCta ? 'none' : `translateY(${(1 - progress) * 18}px)`,
        }}>
          {data.title}
        </h2>
      ) : null}

      {/* Description */}
      {data.desc ? (
        <p style={{
          fontSize: 'clamp(1.35rem, 3.2vw, 1.25rem)',
          fontWeight: 300,
          color: isCta ? descColor : (isHero || isWhiteSection ? '#444' : '#999'),
          maxWidth: '380px',
          lineHeight: 1.7,
          marginTop: '1.2rem',
          opacity: isCta ? 1 : progress,
          transform: isCta ? 'none' : `translateY(${(1 - progress) * 14}px)`,
        }}>
          {data.desc}
        </p>
      ) : null}

      {data.image ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8rem', opacity: progress, transform: `translateY(${(1 - progress) * 18}px)` }}>
          <img
            src={data.image}
            alt={data.title || 'Imagen de sección'}
            style={{ width: 'clamp(120px, 18vw, 200px)', maxWidth: '100%', height: 'auto' }}
          />
        </div>
      ) : null}

      {/* PRODUCTO button removed from this section; header nav links to this section now. */}

      {/* Feature chips */}
      {data.id === 'materials' && (
      <div className="material-button-container" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginTop: '1.5rem', pointerEvents: 'none' }}>  

  {/* Columna Izquierda: Botones */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginTop: '1.5rem', width: '100%' }}>
    {data.features.map((f, i) => (
     <button 
  key={i} 
  onClick={(e) => { e.stopPropagation(); setSelectedMaterial(f); }}
  onMouseEnter={() => setHoveredMaterial(f)} // Detecta cuando entra el mouse
  onMouseLeave={() => setHoveredMaterial(null)} // Detecta cuando sale
  style={{
    padding: '1rem 2rem',
    borderRadius: '100px',
    border: '1px solid rgba(255,205,0,0.5)',
    fontSize: '1.1rem',
    // La cortina sigue al estado (si está seleccionado O si el mouse está encima)
    color: (selectedMaterial === f || hoveredMaterial === f) ? '#000' : 'var(--caterpillar)',
    background: (selectedMaterial === f || hoveredMaterial === f) ? 'var(--caterpillar)' : 'transparent',
    cursor: 'pointer',
    textAlign: 'center',
    pointerEvents: 'auto',
    minWidth: '200px',
    transition: 'background 0.3s ease-out, color 0.3s ease-out'
  }}
>
  {f}
</button>
    ))}
  </div>

  {/* Columna Derecha: El círculo */}
<div style={{ 
  width: '570px', 
  height: '570px', 
  minWidth: '570px', // Fuerza a que no se comprima
  borderRadius: '50%', 
  border: '4px solid var(--caterpillar)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  marginTop: '-250px',
  marginRight: '100px', // Separa del borde derecho
  marginLeft: '270px'  // Empuja al máximo a la derecha
}}>
    {selectedMaterial && (
      <img 
        src={`/${selectedMaterial}.jpg`} 
        alt={selectedMaterial} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )}
  </div>
</div>
      )}


      {/* Extra button removed per design — header controls navigation now */}

      {/* CTA */}
      {isCta && (
    <button
          className={pulse ? 'spec-cta-button pulse btn-racing-directional btn-racing-dark' : 'spec-cta-button btn-racing-directional btn-racing-dark'}
          style={{
            marginTop: '1.5rem',
            padding: '0.9rem 2.8rem',
            background: 'transparent', 
            color: '#000000', /* Texto negro al principio */
            border: '2px solid #000000', /* Borde negro al principio */
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s, color 0.25s ease',
          }}
          onClick={() => {
            setPulse(true)
            scrollToAnchor('seccion-specs')
          }}
          onMouseEnter={handleRacingMouseEnter}
          onMouseLeave={handleRacingMouseLeave}
        >
          VER ESPECIFICACIONES
        </button>
      )}
    </section>
  )
}

function CutawayReveal({ scrollProgress, activePartId, setActivePartId }) {
  const productOpacity = smoothstep(0.88, 0.96, scrollProgress)
  const maskInset = '0 0 0 0'
  const activePart = cutawayParts.find(part => part.id === activePartId) || cutawayParts[0]
  const controlsOpacity = smoothstep(0.92, 1.0, scrollProgress)
  const showFullDetailImage = activePart.detailMode === 'contain' || activePart.id === 'blade-assembly'

  const rootRef = useRef(null)
  const controlButtonRefs = useRef({})
  const hotspotRefs = useRef({})
  const [lineTargets, setLineTargets] = useState({})

  useEffect(() => {
    const updateLines = () => {
      if (!rootRef.current) return
      const rootRect = rootRef.current.getBoundingClientRect()
      const nextTargets = {}

      cutawayParts.forEach(part => {
        const controlBtn = controlButtonRefs.current[part.id]
        const hotspotBtn = hotspotRefs.current[part.id]
        if (!controlBtn || !hotspotBtn) return

        const controlRect = controlBtn.getBoundingClientRect()
        const hotspotRect = hotspotBtn.getBoundingClientRect()

        const controlRightX = controlRect.right - rootRect.left
        const controlMiddleY = controlRect.top + controlRect.height / 2 - rootRect.top
        const hotspotCenterX = hotspotRect.left + hotspotRect.width / 2 - rootRect.left
        const hotspotCenterY = hotspotRect.top + hotspotRect.height / 2 - rootRect.top

        const dx = hotspotCenterX - controlRightX
        const dy = hotspotCenterY - controlMiddleY
        const distance = Math.hypot(dx, dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)

        nextTargets[part.id] = {
          left: controlRightX,
          top: controlMiddleY,
          width: distance,
          angle,
        }
      })

      setLineTargets(nextTargets)
    }

    updateLines()
    window.addEventListener('resize', updateLines)

    return () => window.removeEventListener('resize', updateLines)
  }, [controlsOpacity, scrollProgress, activePartId])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        // only let the inner controls and hotspots capture events
        pointerEvents: 'none',
        opacity: productOpacity,
        transition: 'none',
      }}
    >
      <div
        className="cutaway-left-controls"
        style={{
          position: 'absolute',
          top: 0,
          right: 'auto',
          left: 'clamp(1rem, 3vw, 2.8rem)',
          bottom: 0,
          width: 'min(16rem, 240px)',
          background: 'transparent',
          pointerEvents: 'auto',
          zIndex: 35,
        }}>
        {cutawayParts.map((part, index) => {
          const selected = activePartId === part.id
          const borderColor = selected ? `rgba(255,205,0,${0.35 * controlsOpacity})` : `rgba(240,237,232,${0.12 * controlsOpacity})`
          const bgColor = selected ? `rgba(255,205,0,${0.12 * controlsOpacity})` : `rgba(255,255,255,${0.02 * controlsOpacity})`
          const textColor = selected ? `rgba(255,205,0,${0.95 * controlsOpacity})` : `rgba(240,237,232,${0.9 * controlsOpacity})`
          const dotBg = selected ? `rgba(255,205,0,${0.95 * controlsOpacity})` : `rgba(240,237,232,${0.3 * controlsOpacity})`
          const dotShadow = selected ? `0 0 0 ${8 * controlsOpacity}px rgba(255,205,0,${0.12 * controlsOpacity})` : 'none'
          const rowTop = ['14%', '37%', '61%', '86%'][index]
          const line = lineTargets[part.id] || {}

          return (
            <div key={part.id} style={{ position: 'absolute', left: 0, top: rowTop, transform: 'translateY(-50%)', width: '100%' }}>
              <button
                ref={el => { if (el) controlButtonRefs.current[part.id] = el }}
                type="button"
                onClick={() => setActivePartId(part.id)}
                className="cutaway-left-control btn-racing-directional"
                onMouseEnter={handleRacingMouseEnter}
                onMouseLeave={handleRacingMouseLeave}
                style={{
  padding: '1.2rem 2rem',
  borderRadius: '40px',
  border: '1px solid var(--caterpillar)',
  backgroundColor: 'transparent',
  color: 'var(--caterpillar)',
  marginLeft: '10rem',
  fontSize: '1rem',
  fontWeight: '800', // Súper negrita
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 5px rgba(255,205,0,0.2)'
}}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '0.72rem',
                    height: '0.72rem',
                    borderRadius: '999px',
                    background: dotBg,
                    boxShadow: dotShadow,
                  }} />
                  {part.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
        {cutawayParts.map(part => {
          const selected = activePartId === part.id
          const line = lineTargets[part.id] || {}
          return (
            <span
              key={`line-${part.id}`}
              className="cutaway-left-control-line"
              style={{
                position: 'absolute',
                left: line.left ?? 0,
                top: line.top ?? 0,
                width: line.width ?? 0,
                height: '1px',
                background: selected ? `rgba(255,205,0,${0.95 * controlsOpacity})` : `rgba(255,205,0,${0.18 * controlsOpacity})`,
                transform: `translateY(-50%) rotate(${line.angle ?? 0}deg)`,
                transformOrigin: 'left center',
                borderRadius: '999px',
                pointerEvents: 'none',
                opacity: controlsOpacity * (line.width ? 1 : 0),
                transition: 'opacity 0.2s, width 0.2s, transform 0.2s',
              }}
            />
          )
        })}
      </div>

      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 'clamp(240px, 32vw, 320px)',
        maxWidth: '85vw',
        transform: 'translate(-50%, -50%)',
        clipPath: `inset(${maskInset})`,
        WebkitClipPath: `inset(${maskInset})`,
        // remove yellow glow; keep layout but no colored drop-shadow
        filter: 'none',
      }}>
        <img
          src="/corte-final-batidora.png"
          alt="Corte interno de la batidora manual CAT"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            opacity: 0.98,
          }}
        />

        {cutawayParts.map(part => {
          const selected = activePartId === part.id
          return (
            <button
              ref={el => { if (el) hotspotRefs.current[part.id] = el }}
              key={part.id}
              type="button"
              aria-label={`Enfocar ${part.label}`}
              onClick={() => setActivePartId(part.id)}
              style={{
                position: 'absolute',
                left: part.hotspot.left,
                top: part.hotspot.top,
                width: '1.85rem',
                height: '1.85rem',
                borderRadius: '999px',
                border: selected ? '1px solid var(--accent)' : '1px solid rgba(240,237,232,0.45)',
                background: selected ? 'rgba(255,205,0,0.2)' : 'rgba(6,6,9,0.6)',
                boxShadow: selected
                  ? '0 0 0 10px rgba(255,205,0,0.08), 0 0 28px rgba(255,205,0,0.34)'
                  : '0 0 18px rgba(0,0,0,0.35)',
                  cursor: controlsOpacity > 0.7 ? 'pointer' : 'default',
                  opacity: controlsOpacity,
                  pointerEvents: controlsOpacity > 0.7 ? 'auto' : 'none',
                transform: 'translate(-50%, -50%)',
                transition: 'width 0.2s, height 0.2s, border 0.2s, background 0.2s, box-shadow 0.2s, opacity 0.2s',
              }}
            >
              <span style={{
                position: 'absolute',
                inset: '50% auto auto 50%',
                width: '0.42rem',
                height: '0.42rem',
                borderRadius: '999px',
                background: 'var(--accent)',
                transform: 'translate(-50%, -50%)',
              }} />
            </button>
          )
        })}
      </div>
<div
        className="cutaway-panel"
        key={activePart.id} /* CLAVE: Sincroniza el cambio de datos con la animación */
        style={{
  position: 'absolute',
  right: '10vw', // Aumenta este valor (ej. 10vw, 15vw) para alejarlo del borde derecho
  top: '45%',    // Ajusta este porcentaje para moverlo verticalmente
  width: 'min(55vw, 500px)',
          minWidth: '320px',
          transform: `translateY(-50%) translateX(${(1 - controlsOpacity) * 20}px)`,
          opacity: controlsOpacity,
          pointerEvents: controlsOpacity > 0.6 ? 'auto' : 'none',
          animation: 'fadeInPanel 0.35s ease-out both',
          transition: 'opacity 0.2s, transform 0.2s, width 0.2s',
        }}
      >
        <div style={{
          paddingLeft: '1.1rem',
          marginBottom: (activePart.id === 'body-shell' || activePart.id === 'gear-set' || activePart.id === 'jar' || activePart.id === 'blade-assembly') ? '0.8rem' : '0.6rem',
        }}>
          <span style={{
            display: 'block',
            color: 'var(--caterpillar)',
            fontSize: (activePart.id === 'body-shell' || activePart.id === 'gear-set' || activePart.id === 'jar' || activePart.id === 'blade-assembly') ? '0.8rem' : '0.62rem',
            letterSpacing: '0.28em',
            marginBottom: '0.3rem',
          }}>
            COMPONENTE
          </span>
          <h3 style={{
            margin: 0,
            color: 'var(--text)',
            fontSize: (activePart.id === 'body-shell' || activePart.id === 'gear-set' || activePart.id === 'jar' || activePart.id === 'blade-assembly') ? 'clamp(1.6rem, 2.8vw, 2.4rem)' : 'clamp(1.2rem, 2.2vw, 2rem)',
            lineHeight: 1,
          }}>
            {activePart.label}
          </h3>
          <strong style={{
            display: 'block',
            color: 'rgba(240,237,232,0.72)',
            fontSize: (activePart.id === 'body-shell' || activePart.id === 'gear-set' || activePart.id === 'jar' || activePart.id === 'blade-assembly') ? '0.8rem' : '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.13em',
            marginTop: '0.35rem',
            textTransform: 'uppercase',
          }}>
            {activePart.kicker}
          </strong>
          <p style={{
            color: '#aaa',
            fontSize: (activePart.id === 'body-shell' || activePart.id === 'gear-set' || activePart.id === 'jar' || activePart.id === 'blade-assembly') ? '0.88rem' : '0.78rem',
            lineHeight: 1.6,
            marginTop: '0.5rem',
          }}>
            {activePart.desc}
          </p>
        </div>
        {activePart.id === 'body-shell' && (
          <div style={{
            marginTop: '1.2rem',
            marginLeft: '-1.1rem',
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% + 1.1rem)',
          }}>
            <img
              src="/tapaaa.png"
              alt="Tapa"
              style={{
                display: 'block',
                width: '120%',
                height: 'auto',
                maxHeight: 'none',
                objectFit: 'contain',
                filter: 'brightness(0.95) contrast(1.1)',
              }}
            />
          </div>
        )}
        {activePart.id === 'gear-set' && (
          <div style={{
            marginTop: '1.2rem',
            marginLeft: '-1.1rem',
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% + 1.1rem)',
          }}>
            <img
              src="/vasooo.png"S
              alt="Vaso"
              style={{
                display: 'block',
                width: '85%',
                height: 'auto',
                maxHeight: 'none',
                objectFit: 'contain',
                filter: 'brightness(0.95) contrast(1.1)',
              }}
            />
          </div>
        )}
        {activePart.id === 'jar' && (
          <div style={{
            marginTop: '1.2rem',
            marginLeft: '-1.1rem',
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% + 1.1rem)',
          }}>
            <img
              src="/cuchillarender.png"
              alt="Cuchilla"
              style={{
                display: 'block',
                width: '40%',
                height: 'auto',
                maxHeight: 'none',
                objectFit: 'contain',
                filter: 'brightness(0.95) contrast(1.1)',
              }}
            />
          </div>
        )}
        {activePart.id === 'blade-assembly' && (
          <div style={{
            marginTop: '1.2rem',
            marginLeft: '-1.1rem',
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% + 1.1rem)',
          }}>
            <img
              src="/engranajes1.png"
              alt="Engranajes"
              style={{
                display: 'block',
                width: '55%',
                height: 'auto',
                maxHeight: 'none',
                objectFit: 'contain',
                filter: 'brightness(0.95) contrast(1.1)',
              }}
            />
          </div>
        )}
      </div>

    </div>
  )
}

/* ─── Main overlay ──────────────────────────────────── */
export default function Overlay({ scrollProgress }) {
  const [activeAnchor, setActiveAnchor] = useState(null)
  const [smokeCursor, setSmokeCursor] = useState({ x: 0, y: 0, active: false })
  const [overlayProgress, setOverlayProgress] = useState(0)
  const [heroRatio, setHeroRatio] = useState(1)
  const [heroTransitionProgress, setHeroTransitionProgress] = useState(0)
  const [activeCutawayPartId, setActiveCutawayPartId] = useState(cutawayParts[0].id)
  const [bodyTransitionProgress, setBodyTransitionProgress] = useState(0)

  // Observe the materials section to derive a reliable progress value (0..1)
  useEffect(() => {
    const target = document.getElementById('seccion-cta')
    if (!target) return
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20)
    const obs = new IntersectionObserver(([entry]) => {
      const p = entry.intersectionRatio // 0..1
      const smooth = smoothstep(0.05, 0.85, p)
      setOverlayProgress(smooth)
    }, { threshold: thresholds })
    obs.observe(target)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const target = document.getElementById('seccion-producto')
    if (!target) return
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20)
    const obs = new IntersectionObserver(([entry]) => {
      const ratio = entry.intersectionRatio
      setHeroRatio(ratio)
      setHeroTransitionProgress(smoothstep(0.05, 0.85, 1 - ratio))
    }, { threshold: thresholds })
    obs.observe(target)
    return () => obs.disconnect()
  }, [])

  const scrollToAnchor = (anchor) => {
    const target = document.getElementById(anchor)
    if (!target) return
    setActiveAnchor(anchor)

    const startY = window.scrollY
    const targetY = target.getBoundingClientRect().top + startY
    const duration = 1850
    const startTime = performance.now()

    const ease = (t) => t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t

    const tick = (now) => {
      const elapsed = Math.min(1, (now - startTime) / duration)
      const progress = ease(elapsed)
      window.scrollTo(0, Math.round(startY + (targetY - startY) * progress))
      if (elapsed < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
    window.setTimeout(() => setActiveAnchor(null), duration + 80)
  }
  
  // Component-local helper: render a fixed yellow overlay over a target section
  function YellowSectionOverlay({ progress, targetId }) {
    const [rect, setRect] = useState({ top: 0, height: 0 })

    useEffect(() => {
      function update() {
        const el = document.getElementById(targetId)
        if (!el) return setRect({ top: 0, height: 0 })
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, height: r.height })
      }
      update()
      window.addEventListener('resize', update)
      window.addEventListener('scroll', update, { passive: true })
      return () => {
        window.removeEventListener('resize', update)
        window.removeEventListener('scroll', update)
      }
    }, [targetId])

    return (
      <div style={{ position: 'fixed', left: 0, right: 0, top: rect.top + 'px', height: rect.height + 'px', zIndex: 1, pointerEvents: 'none', background: 'var(--accent)', opacity: progress, transition: 'none' }}>
      </div>
    )
  }
  return (
    <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
      <div
        className={smokeCursor.active ? 'cursor-smoke active' : 'cursor-smoke'}
        style={{
          left: smokeCursor.x,
          top: smokeCursor.y,
        }}
      />
      <style>{`
        section, button, a, span, nav { pointer-events: auto; }
        .cutaway-left-control {
          transition: transform 0.2s, border 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .cutaway-left-control:hover {
          transform: translateX(3px);
          border-color: var(--accent);
          background: rgba(255,205,0,0.15);
        }
        @media (max-width: 760px) {
          .cutaway-panel {
            left: 1rem !important;
            right: 1rem !important;
            top: auto !important;
            bottom: 1rem !important;
            width: auto !important;
            min-width: 0 !important;
            transform: none !important;
          }
          .cutaway-panel-buttons {
            display: none !important;
          }
          .cutaway-left-controls {
            position: fixed !important;
            left: 50% !important;
            top: auto !important;
            bottom: 1rem !important;
            transform: translateX(-50%) !important;
            width: min(92vw, 420px) !important;
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 0.55rem !important;
          }
          .cutaway-left-control {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            width: auto !important;
          }
          .cutaway-left-control-line {
            display: none !important;
          }
        
        /* Agregá esto al final de tu bloque <style> */
@keyframes slideInRight {
  0% { opacity: 0; transform: translateY(-50%) translateX(50px); }
  100% { opacity: 1; transform: translateY(-50%) translateX(0); }
}

@keyframes zoomIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.panel-text-reveal {
  animation: slideInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.panel-image-reveal {
  animation: zoomIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
      `}</style>

      <CutawayReveal
        scrollProgress={scrollProgress}
        activePartId={activeCutawayPartId}
        setActivePartId={setActiveCutawayPartId}
      />

      {/* Yellow overlay targeted to the CTA section. Positions itself over that section and fades with overlayProgress. */}
      <YellowSectionOverlay progress={overlayProgress} targetId="seccion-cta" />

     {sections.map((s) => (
  <div 
    key={s.id} 
    className={s.id === 'hero' ? 'hero-image-bg' : ''}
  >
    <Section
      data={s.id === 'hero' ? { ...s, image: null } : s}
      scrollProgress={scrollProgress}
      transitionProgress={overlayProgress}
      heroTransition={heroTransitionProgress}
      scrollToAnchor={scrollToAnchor}
      focusCutawayPart={setActiveCutawayPartId}
      setBodyProgress={setBodyTransitionProgress}
      bodyProgress={bodyTransitionProgress}
    />
  </div>
))}

      <section id="seccion-specs" aria-hidden="true" style={{ minHeight: '100vh', position: 'relative', zIndex: 0 }} />

      {/* Scroll hint */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        opacity: scrollProgress < 0.04 ? 1 : 0,
        transition: 'opacity 0.4s',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <span style={{
          fontSize: '0.6rem',
          letterSpacing: '0.35em',
          color: 'var(--muted)',
          fontWeight: 300,
        }}>SCROLL</span>
        <div style={{
          width: '1px',
          height: '36px',
          background: 'linear-gradient(to bottom, var(--accent), transparent)',
          animation: 'scrollPulse 2s ease-in-out infinite',
        }} />
        <style>{`
          @keyframes scrollPulse {
            0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
            50% { opacity: 1; transform: scaleY(1); }
            @keyframes fadeInPanel {
          from { opacity: 0; transform: translateY(-50%) translateX(10px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
          }
        `}</style>
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '1.2rem 3rem',
        zIndex: 50,
        opacity: scrollProgress > 0.9 ? 1 - smoothstep(0.9, 0.96, scrollProgress) : 1,
        background: scrollProgress > 0.02
          ? 'linear-gradient(to bottom, rgba(6,6,9,0.92), transparent)'
          : 'transparent',
        transition: 'background 0.4s, opacity 0.3s',
      }}>
        <div className="nav-links" style={{
          opacity: smoothstep(0.05, 0.85, heroRatio),
          transition: 'opacity 420ms ease',
          pointerEvents: heroRatio > 0.05 ? 'auto' : 'none',
        }}>
        {[
            { label: 'Producto', anchor: 'seccion-hero-image' },
            { label: 'Despiece', anchor: 'seccion-despiece' },
            { label: 'Especificaciones', anchor: 'seccion-cta' },
          ].map(link => (
            <a
              key={link.label}
              href={`#${link.anchor}`}
              className={`nav-button btn-racing-directional ${activeAnchor === link.anchor ? 'nav-button-active' : ''}`}
              onClick={event => {
                event.preventDefault()
                scrollToAnchor(link.anchor)
              }}
              onMouseEnter={handleRacingMouseEnter}
              onMouseLeave={handleRacingMouseLeave}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
