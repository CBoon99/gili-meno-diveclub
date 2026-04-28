import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Foreground canvas. Sits ABOVE the hero text (z-10) with `pointer-events-none`,
 * so it cannot interfere with SEO (text stays in DOM) or interaction.
 *
 * Renders:
 *  - Two large fish that occasionally cross the viewport (close to camera)
 *  - Rising bubbles
 *  - Close-up plankton sparkles
 *
 * Reduced-motion users get nothing rendered.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const FG_FISH = 6

function ForegroundFish() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => new THREE.ConeGeometry(0.18, 0.55, 6), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#bae6fd'),
        metalness: 0.6,
        roughness: 0.25,
        emissive: new THREE.Color('#0aaddb'),
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.94,
      }),
    [],
  )

  const seeds = useMemo(
    () =>
      Array.from({ length: FG_FISH }, (_, i) => ({
        speed: 0.55 + Math.random() * 0.45,
        depth: -0.5 + Math.random() * 1.2, // close-ish to camera
        yBase: -1.6 + (i / FG_FISH) * 3.2 + (Math.random() - 0.5) * 0.6,
        amp: 0.25 + Math.random() * 0.6,
        wobbleSpeed: 0.6 + Math.random() * 0.7,
        scale: 0.85 + Math.random() * 0.5,
        direction: i % 2 === 0 ? 1 : -1,
        offset: Math.random() * 18,
      })),
    [],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      const range = 18
      const x = (((t * s.speed + s.offset) % range) - range / 2) * s.direction
      const y = s.yBase + Math.sin(t * s.wobbleSpeed + s.offset) * s.amp
      const z = s.depth + Math.cos(t * 0.4 + s.offset) * 0.25

      dummy.position.set(x, y, z)
      tmp.set(x + s.direction, y, z)
      dummy.lookAt(tmp)
      dummy.rotateX(Math.PI / 2)
      dummy.scale.setScalar(s.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, FG_FISH]} frustumCulled={false} />
}

function Bubbles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const COUNT = 40
  const geo = useMemo(() => new THREE.SphereGeometry(0.06, 12, 12), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.6,
        emissive: new THREE.Color('#7dd3fc'),
        emissiveIntensity: 0.4,
        depthWrite: false,
      }),
    [],
  )

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: -7 + Math.random() * 14,
        baseY: -3 - Math.random() * 4,
        z: -1 + Math.random() * 2,
        speed: 0.7 + Math.random() * 1.3,
        scale: 0.4 + Math.random() * 1.6,
        offset: Math.random() * 10,
        wobble: 0.05 + Math.random() * 0.18,
      })),
    [],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      const cycle = ((t * s.speed + s.offset) % 9) // ~9 unit travel
      const y = s.baseY + cycle
      const x = s.x + Math.sin((t + s.offset) * 1.6) * s.wobble
      dummy.position.set(x, y, s.z)
      dummy.scale.setScalar(s.scale * (0.55 + cycle / 9))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, COUNT]} frustumCulled={false} />
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} color="#bae6fd" />
      <pointLight position={[2, 2, 4]} intensity={1.2} color="#7dd3fc" distance={20} />
      <ForegroundFish />
      <Bubbles />
      <Sparkles
        count={80}
        scale={[14, 8, 4]}
        position={[0, 0.5, 0]}
        size={3.4}
        speed={0.45}
        color="#e0f2fe"
        opacity={0.9}
      />
    </>
  )
}

export default function HeroForeground() {
  const [enableScene, setEnableScene] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEnableScene(false)
      return
    }
    setEnableScene(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setEnableScene(!mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!enableScene) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full [&_canvas]:h-full [&_canvas]:w-full"
    >
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
