import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Drifting sediment particles. Each particle slowly orbits a point with a
 * unique radius / phase. Speeds up briefly when a target element is hovered,
 * decays back to idle. Instanced for cheap rendering.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface Props {
  /** CSS selector for hover-target elements to react to */
  targetSelector?: string
  count?: number
}

interface Speed {
  current: number
  target: number
}

function Sediment({ count, speed }: { count: number; speed: React.MutableRefObject<Speed> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => new THREE.SphereGeometry(0.05, 6, 6), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#a0aec0',
        transparent: true,
        opacity: 0.55,
        emissive: new THREE.Color('#5a6b7a'),
        emissiveIntensity: 0.3,
        depthWrite: false,
      }),
    [],
  )

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        radius: 1.5 + Math.random() * 5.5,
        phase: Math.random() * Math.PI * 2,
        height: -3 + Math.random() * 6,
        depth: -1 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7,
        scale: 0.4 + Math.random() * 1.4,
        bobAmp: 0.05 + Math.random() * 0.18,
        bobSpeed: 0.4 + Math.random() * 1.0,
      })),
    [count],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, dt) => {
    speed.current.current = THREE.MathUtils.lerp(speed.current.current, speed.current.target, 0.07)
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const sp = speed.current.current

    seeds.forEach((s, i) => {
      const a = s.phase + t * s.speed * sp * 0.4
      const x = Math.cos(a) * s.radius
      const z = Math.sin(a) * s.radius * 0.45 + s.depth
      const y = s.height + Math.sin(t * s.bobSpeed + s.phase) * s.bobAmp
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(s.scale * (0.85 + Math.sin(t * 0.7 + s.phase) * 0.15))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />
}

export default function SedimentParticles({ targetSelector, count = 240 }: Props) {
  const [enabled, setEnabled] = useState(false)
  const speed = useRef<Speed>({ current: 0.8, target: 0.8 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setEnabled(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!enabled || !targetSelector || typeof document === 'undefined') return
    const els = document.querySelectorAll<HTMLElement>(targetSelector)
    const onEnter = () => {
      speed.current.target = 1.8
    }
    const onLeave = () => {
      speed.current.target = 0.8
    }
    els.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      el.addEventListener('focusin', onEnter)
      el.addEventListener('focusout', onLeave)
    })
    return () => {
      els.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.removeEventListener('focusin', onEnter)
        el.removeEventListener('focusout', onLeave)
      })
    }
  }, [enabled, targetSelector])

  if (!enabled) return null

  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.4]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 30 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} color="#bae6fd" />
        <pointLight position={[3, 3, 4]} intensity={1.1} color="#7dd3fc" distance={20} />
        <Sediment count={count} speed={speed} />
      </Suspense>
    </Canvas>
  )
}
