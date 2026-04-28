import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Sinuous eel weaving on a Catmull-Rom S-curve. 12 segments, each follows
 * the path with a fixed offset for a serpentine body. Loops every ~10s.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const SEGMENTS = 14
/** Distance between segments along the curve (0..1) */
const SEG_GAP = 0.025

function EelBody() {
  const meshes = useRef<THREE.Mesh[]>([])
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-12, -2.5, -1),
          new THREE.Vector3(-7, 1.5, 0.5),
          new THREE.Vector3(-2, -1, -0.5),
          new THREE.Vector3(3, 1.8, 1),
          new THREE.Vector3(8, -1.5, -0.5),
          new THREE.Vector3(13, 1.5, 0),
        ],
        false,
        'catmullrom',
        0.4,
      ),
    [],
  )
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cycle = (t * 0.1) % 1
    meshes.current.forEach((m, i) => {
      if (!m) return
      const offset = (cycle - i * SEG_GAP + 1) % 1
      curve.getPointAt(offset, tmp)
      const ahead = (offset + 0.01) % 1
      curve.getPointAt(ahead, tmpLook)

      // Body wobble perpendicular to motion (sinusoidal)
      const wob = Math.sin(t * 6 - i * 0.55) * 0.08
      tmp.y += wob

      m.position.copy(tmp)
      m.lookAt(tmpLook)
      m.rotateX(Math.PI / 2)

      // Tail wag — extra rotation on last few segments
      if (i >= SEGMENTS - 3) {
        m.rotation.z += Math.sin(t * 4 - i * 0.4) * 0.4
      }
    })
  })

  return (
    <group>
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const taperBody = 0.18 - (i / SEGMENTS) * 0.13
        const taperLen = 0.32 - (i / SEGMENTS) * 0.18
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) meshes.current[i] = el
            }}
          >
            <capsuleGeometry args={[Math.max(taperBody, 0.04), Math.max(taperLen, 0.05), 4, 8]} />
            <meshStandardMaterial
              color="#2d5016"
              roughness={0.6}
              metalness={0.2}
              emissive="#6b8e23"
              emissiveIntensity={0.35}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Eel() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setEnabled(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (!enabled) return null

  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.4]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 9.5], fov: 50, near: 0.1, far: 40 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} color="#bae6fd" />
        <pointLight position={[0, 4, 4]} intensity={1.2} color="#7dd3fc" distance={26} />
        <fog attach="fog" args={['#051a2c', 8, 22]} />
        <EelBody />
      </Suspense>
    </Canvas>
  )
}
