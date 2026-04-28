import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Sea-bed decoration — shells + small coral fall from the top of the canvas
 * once on mount, drift slightly sideways, then settle and idle gently.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface DecorItem {
  ref: React.RefObject<THREE.Group | null>
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  delay: number
  rotZ: number
  type: 'shell' | 'coral' | 'rock'
  color: string
  scale: number
}

function Shell({ tint }: { tint: string }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.6, 0.4, 16, 1, true]} />
        <meshStandardMaterial color={tint} roughness={0.7} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
        <torusGeometry args={[0.4, 0.06, 12, 24]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
    </group>
  )
}

function Coral({ tint }: { tint: string }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.07, 0.13, 0.7, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 0.3, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.05, 0.09, 0.45, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[-0.18, 0.25, 0.05]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.05, 0.09, 0.4, 10]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0.04, 0.45, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color="#ff8c69" emissive="#9c3a14" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Rock({ tint }: { tint: string }) {
  return (
    <mesh>
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color={tint} roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

function Scene() {
  const items = useMemo<DecorItem[]>(() => {
    return [
      { type: 'shell', color: '#d2b48c', startX: -7, startY: 6, endX: -6.4, endY: -3.2, duration: 3.2, delay: 0.0, rotZ: -0.4, scale: 1.1, ref: { current: null } },
      { type: 'shell', color: '#a0826d', startX: -2, startY: 7, endX: -2.2, endY: -3.1, duration: 3.6, delay: 0.3, rotZ: 0.6, scale: 1, ref: { current: null } },
      { type: 'coral', color: '#c8836b', startX: 1.6, startY: 6.5, endX: 1.4, endY: -3, duration: 3.4, delay: 0.55, rotZ: 0.1, scale: 1.05, ref: { current: null } },
      { type: 'shell', color: '#8b7355', startX: 4, startY: 6, endX: 4.4, endY: -3.2, duration: 3.4, delay: 0.7, rotZ: -0.3, scale: 0.9, ref: { current: null } },
      { type: 'rock', color: '#5b6b6e', startX: 6.8, startY: 7, endX: 6.5, endY: -3.3, duration: 3.2, delay: 0.4, rotZ: 0.2, scale: 0.85, ref: { current: null } },
      { type: 'coral', color: '#a85e3d', startX: -4.8, startY: 7.5, endX: -4.6, endY: -3.05, duration: 3.7, delay: 0.85, rotZ: -0.05, scale: 0.95, ref: { current: null } },
    ]
  }, [])

  // refs are created via callback in render

  useEffect(() => {
    items.forEach((it) => {
      const g = it.ref.current
      if (!g) return
      g.position.set(it.startX, it.startY, 0)
      g.rotation.set(0, 0, 0)
      gsap.to(g.position, {
        x: it.endX,
        y: it.endY,
        duration: it.duration,
        delay: it.delay,
        ease: 'power1.inOut',
      })
      gsap.to(g.rotation, {
        z: it.rotZ,
        duration: it.duration,
        delay: it.delay,
        ease: 'power1.inOut',
      })
    })
  }, [items])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    items.forEach((it, i) => {
      const g = it.ref.current
      if (!g) return
      // tiny idle bob after settle
      g.position.y = it.endY + Math.sin(t * 0.5 + i) * 0.03
    })
  })

  return (
    <group>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(el) => {
            it.ref.current = el
          }}
          scale={it.scale}
        >
          {it.type === 'shell' && <Shell tint={it.color} />}
          {it.type === 'coral' && <Coral tint={it.color} />}
          {it.type === 'rock' && <Rock tint={it.color} />}
        </group>
      ))}
      {/* sandy floor strip */}
      <mesh position={[0, -3.6, -1]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[24, 2.4]} />
        <meshStandardMaterial color="#22384a" roughness={0.95} transparent opacity={0.65} />
      </mesh>
    </group>
  )
}

export default function SeabedDecor() {
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
        <ambientLight intensity={0.6} color="#bae6fd" />
        <directionalLight position={[3, 6, 4]} intensity={1.0} color="#fff7e6" />
        <pointLight position={[-3, 2, 3]} intensity={0.7} color="#7dd3fc" distance={18} />
        <fog attach="fog" args={['#0a2638', 8, 20]} />
        <Scene />
      </Suspense>
    </Canvas>
  )
}
