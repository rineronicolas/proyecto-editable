import fs from 'fs'
import path from 'path'
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const file = path.resolve('public', 'animacion-batidora.glb')
const arrayBuffer = fs.readFileSync(file).buffer
const loader = new GLTFLoader()
loader.parse(arrayBuffer, path.dirname(file) + '/', gltf => {
  const materials = new Map()
  gltf.scene.traverse(obj => {
    if (obj.isMesh) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(m => {
        if (!m) return
        let entry = materials.get(m.name)
        if (!entry) {
          entry = {
            count: 0,
            name: m.name,
            type: m.type,
            transparent: m.transparent,
            opacity: m.opacity,
            alphaTest: m.alphaTest,
            side: m.side,
            color: m.color ? m.color.getHexString() : null,
            metalness: m.metalness,
            roughness: m.roughness,
            transmission: m.transmission,
            ior: m.ior,
            map: !!m.map,
            envMap: !!m.envMap,
          }
          materials.set(m.name, entry)
        }
        entry.count += 1
      })
      console.log('MESH', obj.name, obj.material && (Array.isArray(obj.material) ? obj.material.map(m => m.name).join(', ') : obj.material.name))
    }
  })
  console.log('\nMATERIALS:')
  for (const [name, entry] of materials.entries()) {
    console.log(entry)
  }
}, err => {
  console.error('loader error', err)
})
