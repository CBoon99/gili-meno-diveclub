import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Lightweight reef background — a few coral towers + soft particles.
 * Used behind decorative content (e.g. the booking form) at low opacity.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function CoralBranch({ position, scale = 1, tint = '#ff8c69' }: { position: [number, number, number]; scale?: number; tint?: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.06
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.16, 1.2, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} emissive={tint} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.3, 0.55, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.07, 0.12, 0.7, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[-0.3, 0.45, 0.1]} rotation={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.07, 0.12, 0.7, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0.05, 0.85, 0]}>
        <sphereGeometry args={[0.16, 14, 12]} />
        <meshStandardMaterial color={tint} roughness={0.45} emissive={tint} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Scene() {
  const items = useMemo(
    () => [
      { pos: [-4, -2.5, 0] as [number, number, number], s: 1.0, c: '#ff8c69' },
      { pos: [-1.5, -2.5, -0.6] as [number, number, number], s: 0.85, c: '#ffb37a' },
      { pos: [1.5, -2.5, 0.4] as [number, number, number], s: 0.95, c: '#f8a4c2' },
      { pos: [4.2, -2.5, -0.2] as [number, number, number], s: 0.9, c: '#ff8c69' },
    ],
    [],
  )
  return (
    <group>
      {items.map((it, i) => (
        <CoralBranch key={i} position={it.pos} scale={it.s} tint={it.c} />
      ))}
      <mesh position={[0, -3.6, -1]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[28, 2.4]} />
        <meshStandardMaterial color="#0a2638" roughness={0.95} transparent opacity={0.45} />
      </mesh>
      <Sparkles count={70} scale={[14, 8, 4]} position={[0, 0, 0]} size={2.4} speed={0.35} color="#bae6fd" opacity={0.7} />
    </group>
  )
}

export default function CoralScene() {
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
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 30 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} color="#bae6fd" />
        <pointLight position={[2, 4, 3]} intensity={1.0} color="#fff7e6" distance={22} />
        <pointLight position={[-3, 0, 2]} intensity={0.6} color="#7dd3fc" distance={18} />
        <fog attach="fog" args={['#051a2c', 8, 22]} />
        <Scene />
      </Suspense>
    </Canvas>
  )
}
