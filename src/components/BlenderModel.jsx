import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function lerp(a, b, t) { return a + (b - a) * t }
function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

function isSemiTransparentMaterial(material) {
  if (!material) return false
  const name = material.name || ''
  const transparentName = /plastic|acryl|glass|trans|clear|plexi|polycarbonate|pc|pmma|resina|pl[áa]stico/i
  return transparentName.test(name) || (material.opacity != null && material.opacity < 0.98) || material.alphaTest > 0 || material.transmission > 0
}

function shouldSkipClipping(object, materials) {
  const skipName = /tapa|lid|cap|cover|top|couvercle|tamp|tapas/i
  if (skipName.test(object.name || '')) return true
  return materials.some(material => skipName.test(material.name || ''))
}

export default function BlenderModel({ scrollProgress }) {
  const group = useRef()
  const revealPlane = useRef(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0))
  const { scene, animations } = useGLTF('/animacion batidora.glb')
  const { actions, mixer } = useAnimations(animations, group)
  const { camera, gl } = useThree()

  // (Lógica interna intacta...)
  const anim = useRef({ rotY: 0, cx: 0, cy: 14, cz: 38, lx: 0, ly: 9.5, lz: 0, fov: 35, animProgress: 0, revealProgress: 0 })

  useEffect(() => {
    const bounds = new THREE.Box3().setFromObject(scene)
    gl.localClippingEnabled = true
    scene.traverse(object => {
      if (!object.isMesh) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.filter(Boolean).forEach(material => {
        material.clippingPlanes = [revealPlane.current]
        material.needsUpdate = true
      })
    })
  }, [gl, scene])

  useFrame((_, delta) => {
    // (Tu lógica de scroll se mantiene aquí...)
    if (actions) mixer.update(0)
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <group ref={group} dispose={null}>
        <primitive object={scene} />
      </group>
    </>
  )
}