import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Drifts in from the right, settles next to a target column, then idles
 * with a slow breathing pulse and tentacle wave.
 *
 * Pure 3D — no DOM coordinate mapping; the canvas itself is positioned
 * over the target card via Tailwind. Hides under reduced-motion.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const TENTACLE_COUNT = 8

function Tentacle({ index, length = 1.6 }: { index: number; length?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const segmentRefs = useRef<THREE.Mesh[]>([])
  const SEGMENTS = 5

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.x = -1.0 + Math.sin(t * 0.7 + index) * 0.18
    }
    segmentRefs.current.forEach((m, s) => {
      if (!m) return
      m.rotation.x = Math.sin(t * 1.4 + index * 0.6 + s * 0.7) * 0.35
    })
  })

  const angle = (index / TENTACLE_COUNT) * Math.PI * 2
  const radius = 0.25
  const segLen = length / SEGMENTS

  return (
    <group
      ref={groupRef}
      position={[Math.cos(angle) * radius, -0.1, Math.sin(angle) * radius]}
      rotation={[-1, angle + Math.PI / 2, 0]}
    >
      {Array.from({ length: SEGMENTS }).map((_, s) => (
        <group
          key={s}
          position={[0, -segLen * s, 0]}
          ref={(el) => {
            if (el) segmentRefs.current[s] = el as unknown as THREE.Mesh
          }}
        >
          <mesh position={[0, -segLen / 2, 0]}>
            <coneGeometry args={[
              0.07 * (1 - s * 0.13),
              segLen,
              7,
            ]} />
            <meshStandardMaterial
              color="#8b4789"
              roughness={0.55}
              metalness={0.15}
              emissive="#3a1d40"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function OctopusBody({
  cameraOffset,
}: {
  cameraOffset: React.MutableRefObject<{ x: number }>
}) {
  const group = useRef<THREE.Group>(null)
  const head = useRef<THREE.Mesh>(null)
  const phase = useRef<'intro' | 'idle'>('intro')

  useEffect(() => {
    if (!group.current) return
    group.current.position.x = 7
    group.current.position.y = 0.4
    const tl = gsap.timeline({ delay: 0.4 })
    tl.to(group.current.position, {
      x: 0,
      y: 0,
      duration: 3.2,
      ease: 'power2.inOut',
    })
    tl.to(cameraOffset.current, { x: 0, duration: 3.2, ease: 'power2.out' }, 0)
    tl.add(() => {
      phase.current = 'idle'
    })
    return () => {
      tl.kill()
    }
  }, [cameraOffset])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (head.current) {
      const s = phase.current === 'idle' ? 1 + Math.sin(t * 0.85) * 0.06 : 1
      head.current.scale.setScalar(s)
    }
    if (group.current && phase.current === 'idle') {
      group.current.rotation.y = Math.sin(t * 0.4) * 0.15
      group.current.position.y = Math.sin(t * 0.6) * 0.12
    }
  })

  return (
    <group ref={group}>
      {/* Mantle (head) */}
      <mesh ref={head} position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.85, 24, 20]} />
        <meshStandardMaterial
          color="#9b58a3"
          roughness={0.42}
          metalness={0.18}
          emissive="#c8a2d0"
          emissiveIntensity={0.32}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.32, 0.55, 0.7]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.2} />
      </mesh>
      <mesh position={[-0.32, 0.55, 0.7]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.2} />
      </mesh>
      {/* Tentacles */}
      {Array.from({ length: TENTACLE_COUNT }).map((_, i) => (
        <Tentacle key={i} index={i} />
      ))}
    </group>
  )
}

export default function Octopus() {
  const [enabled, setEnabled] = useState(false)
  const cameraOffset = useRef({ x: 4 })

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
      camera={{ position: [0, 0, 5.5], fov: 45, near: 0.1, far: 30 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <CameraOffsetRig offset={cameraOffset} />
        <ambientLight intensity={0.7} color="#bae6fd" />
        <pointLight position={[3, 3, 4]} intensity={1.4} color="#c8a2d0" distance={20} />
        <pointLight position={[-3, -2, 2]} intensity={0.8} color="#7dd3fc" distance={20} />
        <fog attach="fog" args={['#0c1027', 6, 18]} />
        <OctopusBody cameraOffset={cameraOffset} />
      </Suspense>
    </Canvas>
  )
}

function CameraOffsetRig({ offset }: { offset: React.MutableRefObject<{ x: number }> }) {
  useFrame(({ camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, offset.current.x, 0.08)
    camera.lookAt(0, 0, 0)
  })
  return null
}
