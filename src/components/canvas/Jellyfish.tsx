import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Floating jellyfish — pulsing bell + 8 swaying tentacles.
 * Sits softly in the background of a section, drifting in place.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const TENTACLES = 10

function JellyfishBody() {
  const root = useRef<THREE.Group>(null)
  const bell = useRef<THREE.Mesh>(null)
  const tentacles = useRef<THREE.Group[]>([])

  /* Bell geometry — half-sphere flattened a touch */
  const bellGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), [])
  const tentacleGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.02, 1.1, 8), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.4) * 0.55
      root.current.rotation.y = t * 0.07
    }
    if (bell.current) {
      const pulse = 0.95 + Math.sin(t / 3 * Math.PI * 2) * 0.06
      bell.current.scale.set(pulse, 0.85 + Math.sin(t / 3 * Math.PI * 2) * 0.07, pulse)
    }
    tentacles.current.forEach((g, i) => {
      if (!g) return
      const phase = (i * Math.PI) / 5
      g.rotation.x = Math.sin(t * 1.3 + phase) * 0.32
      g.rotation.z = Math.sin(t * 1.0 + phase * 1.3) * 0.16
    })
  })

  return (
    <group ref={root} position={[0, 0.5, 0]}>
      {/* bell */}
      <mesh ref={bell} geometry={bellGeo} castShadow={false}>
        <meshStandardMaterial
          color="#e0e7ff"
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.55}
          emissive="#c0d9ff"
          emissiveIntensity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* inner glow */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial
          color="#a7c4ff"
          transparent
          opacity={0.32}
          emissive="#7aa0ff"
          emissiveIntensity={0.7}
          depthWrite={false}
        />
      </mesh>
      {/* tentacles */}
      {Array.from({ length: TENTACLES }).map((_, i) => {
        const angle = (i / TENTACLES) * Math.PI * 2
        const r = 0.5 + (i % 3) * 0.05
        return (
          <group
            key={i}
            ref={(el) => {
              if (el) tentacles.current[i] = el
            }}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
          >
            <mesh geometry={tentacleGeo} position={[0, -0.65, 0]}>
              <meshStandardMaterial
                color="#dbeafe"
                roughness={0.4}
                metalness={0.05}
                transparent
                opacity={0.45}
                emissive="#93c5fd"
                emissiveIntensity={0.4}
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

interface JellyfishProps {
  /** World-space position of the jellyfish */
  position?: [number, number, number]
}

export default function Jellyfish({ position = [0, 0, -3] }: JellyfishProps) {
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
      camera={{ position: [0, 0, 5.5], fov: 50, near: 0.1, far: 25 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} color="#bae6fd" />
        <pointLight position={[2, 4, 3]} intensity={1.6} color="#dbeafe" distance={18} />
        <pointLight position={[-3, -1, 2]} intensity={0.9} color="#93c5fd" distance={18} />
        <fog attach="fog" args={['#0a1640', 6, 16]} />
        <group position={position}>
          <JellyfishBody />
        </group>
      </Suspense>
    </Canvas>
  )
}
