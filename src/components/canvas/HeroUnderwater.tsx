import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const FISH_COUNT = 110
const BOUNDS = 22
const BOUNDS_Y = 10

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Stylized diver — drop a CC0 `public/assets/models/diver.glb` later and swap for useGLTF if desired */
function StylizedDiver() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 0.55) * 0.35
    group.current.rotation.y = Math.sin(t * 0.22) * 0.12
    group.current.rotation.z = Math.sin(t * 0.31) * 0.06
  })
  return (
    <group ref={group} position={[1.2, -0.3, 2]} scale={1.15}>
      <mesh castShadow rotation={[0.25, -0.4, 0]}>
        <capsuleGeometry args={[0.38, 0.95, 6, 12]} />
        <meshStandardMaterial color="#1a2332" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.75, 0.15]} castShadow rotation={[0.08, -0.2, 0]}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color="#c49a7a" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.38]} rotation={[0.15, 0.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.15} transparent opacity={0.55} />
      </mesh>
      <mesh position={[-0.38, 0.1, -0.28]} castShadow rotation={[0, 0.5, -0.2]}>
        <cylinderGeometry args={[0.14, 0.18, 0.55, 10]} />
        <meshStandardMaterial color="#2d3a4a" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.45, -0.55, 0.15]} castShadow rotation={[0.15, 0, 0.85]}>
        <boxGeometry args={[0.55, 0.05, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.45, -0.55, 0.18]} castShadow rotation={[0.18, 0, -0.85]}>
        <boxGeometry args={[0.55, 0.05, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  )
}

function BoidFishSchool() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => new THREE.ConeGeometry(0.12, 0.35, 5), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        metalness: 0.25,
        roughness: 0.35,
        emissive: new THREE.Color('#0c4a63'),
        emissiveIntensity: 0.35,
      }),
    [],
  )

  const data = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const vel: THREE.Vector3[] = []
    for (let i = 0; i < FISH_COUNT; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * BOUNDS * 1.6,
          (Math.random() - 0.5) * BOUNDS_Y,
          (Math.random() - 0.5) * BOUNDS * 1.2 - 4,
        ),
      )
      vel.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.08,
        ),
      )
    }
    return { pos, vel }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const sep = useMemo(() => new THREE.Vector3(), [])
  const push = useMemo(() => new THREE.Vector3(), [])
  const ali = useMemo(() => new THREE.Vector3(), [])
  const coh = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    const { pos, vel } = data
    const maxSpeed = 0.14
    const minSep = 1.1
    const sight = 4.5

    for (let i = 0; i < FISH_COUNT; i++) {
      sep.set(0, 0, 0)
      ali.set(0, 0, 0)
      coh.set(0, 0, 0)
      let n = 0
      const pi = pos[i]

      for (let j = 0; j < FISH_COUNT; j++) {
        if (i === j) continue
        const pj = pos[j]
        const dist = pi.distanceTo(pj)
        if (dist > sight || dist < 0.001) continue
        n++
        if (dist < minSep) {
          push.copy(pi).sub(pj).normalize().multiplyScalar((minSep - dist) / minSep)
          sep.add(push)
        }
        ali.add(vel[j])
        coh.add(pj)
      }

      if (n > 0) {
        ali.multiplyScalar(1 / n).sub(vel[i]).multiplyScalar(0.04)
        coh.multiplyScalar(1 / n).sub(pi).multiplyScalar(0.018)
      } else {
        ali.set(0, 0, 0)
        coh.set(0, 0, 0)
      }

      sep.multiplyScalar(0.09)
      vel[i].add(sep).add(ali).add(coh)
      if (vel[i].length() > maxSpeed) vel[i].normalize().multiplyScalar(maxSpeed)

      pi.addScaledVector(vel[i], dt * 42)

      if (Math.abs(pi.x) > BOUNDS) {
        pi.x = THREE.MathUtils.clamp(pi.x, -BOUNDS, BOUNDS)
        vel[i].x *= -0.6
      }
      if (Math.abs(pi.y) > BOUNDS_Y * 0.85) {
        pi.y = THREE.MathUtils.clamp(pi.y, -BOUNDS_Y * 0.85, BOUNDS_Y * 0.85)
        vel[i].y *= -0.6
      }
      if (pi.z > 2 || pi.z < -BOUNDS - 6) {
        pi.z = THREE.MathUtils.clamp(pi.z, -BOUNDS - 6, 2)
        vel[i].z *= -0.6
      }

      dummy.position.copy(pi)
      dummy.lookAt(pi.clone().add(vel[i]))
      dummy.rotateX(Math.PI / 2)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, FISH_COUNT]} frustumCulled={false} />
  )
}

function SeaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOUNDS_Y - 0.2, -4]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#0a3a4f" metalness={0.05} roughness={0.92} />
    </mesh>
  )
}

function CausticLight() {
  const ref = useRef<THREE.SpotLight>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.x = Math.sin(t * 0.4) * 8
    ref.current.position.z = Math.cos(t * 0.35) * 6 - 2
    ref.current.intensity = 2.2 + Math.sin(t * 0.8) * 0.35
  })
  return (
    <>
      <spotLight
        ref={ref}
        position={[4, 16, 2]}
        angle={0.55}
        penumbra={0.85}
        intensity={2.4}
        color="#7dd3fc"
        castShadow={false}
      />
    </>
  )
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={['#051a2c']} />
      <fog attach="fog" args={['#051a2c', 14, 52]} />
      <ambientLight intensity={0.38} color="#7dd3fc" />
      <directionalLight position={[-6, 18, 4]} intensity={0.85} color="#e0f2fe" />
      <CausticLight />
      <pointLight position={[10, 2, -8]} intensity={1.1} color="#0aaddb" distance={40} decay={2} />
      <Stars radius={80} depth={40} count={900} factor={2.4} saturation={0} speed={0.25} />
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.35}>
        <BoidFishSchool />
      </Float>
      <StylizedDiver />
      <SeaFloor />
    </>
  )
}

export default function HeroUnderwater() {
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
    <div className="pointer-events-none absolute inset-0 -z-10 h-full min-h-[100svh] w-full [&_canvas]:h-full [&_canvas]:w-full">
      <Canvas
        shadows={false}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [-3.2, 1.4, 9.5], fov: 42, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
