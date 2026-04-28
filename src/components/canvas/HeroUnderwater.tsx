import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Stars } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const FISH_COUNT = 140
const BOUNDS = 22
const BOUNDS_Y = 10

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ---------- Shared diver mesh ---------- */
function DiverMesh({ scale = 1, tint = '#1a2332' }: { scale?: number; tint?: string }) {
  return (
    <group scale={scale}>
      <mesh rotation={[0.25, -0.4, 0]}>
        <capsuleGeometry args={[0.38, 0.95, 6, 12]} />
        <meshStandardMaterial color={tint} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.75, 0.15]} rotation={[0.08, -0.2, 0]}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color="#c49a7a" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.38]} rotation={[0.15, 0.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.12} transparent opacity={0.55} />
      </mesh>
      <mesh position={[-0.38, 0.1, -0.28]} rotation={[0, 0.5, -0.2]}>
        <cylinderGeometry args={[0.14, 0.18, 0.55, 10]} />
        <meshStandardMaterial color="#2d3a4a" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.45, -0.55, 0.15]} rotation={[0.15, 0, 0.85]}>
        <boxGeometry args={[0.55, 0.05, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.45, -0.55, 0.18]} rotation={[0.18, 0, -0.85]}>
        <boxGeometry args={[0.55, 0.05, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Hero diver — stays close to camera, gentle hover */
function HeroDiver() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.position.y = -0.3 + Math.sin(t * 0.55) * 0.35
    group.current.rotation.y = Math.sin(t * 0.22) * 0.12
    group.current.rotation.z = Math.sin(t * 0.31) * 0.06
  })
  return (
    <group ref={group} position={[1.2, -0.3, 2]}>
      <DiverMesh scale={1.2} />
    </group>
  )
}

/** A diver that swims along a Catmull-Rom curve, looping */
function SwimmingDiver({
  points,
  speed,
  scale = 0.9,
  tint = '#1a2332',
  startOffset = 0,
}: {
  points: THREE.Vector3[]
  speed: number
  scale?: number
  tint?: string
  startOffset?: number
}) {
  const group = useRef<THREE.Group>(null)
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, true, 'centripetal'), [points])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!group.current) return
    const t = (state.clock.elapsedTime * speed + startOffset) % 1
    curve.getPointAt(t, tmp)
    curve.getPointAt((t + 0.01) % 1, tmpLook)
    group.current.position.copy(tmp)
    group.current.lookAt(tmpLook)
    group.current.rotateX(Math.PI / 2)
    group.current.position.y += Math.sin(state.clock.elapsedTime * 1.5 + startOffset * 6) * 0.18
  })

  return (
    <group ref={group}>
      <DiverMesh scale={scale} tint={tint} />
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
        emissiveIntensity: 0.45,
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
  /** Soft attractor near the H1 (left of camera, eye-level) so fish meander around the text */
  const attractor = useMemo(() => new THREE.Vector3(-3.5, 1.6, 1.2), [])
  const toAtt = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    const { pos, vel } = data
    const maxSpeed = 0.16
    const minSep = 1.05
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
        ali.multiplyScalar(1 / n).sub(vel[i]).multiplyScalar(0.045)
        coh.multiplyScalar(1 / n).sub(pi).multiplyScalar(0.02)
      } else {
        ali.set(0, 0, 0)
        coh.set(0, 0, 0)
      }

      // soft pull toward H1 attractor (only every Nth fish, weakly)
      if (i % 4 === 0) {
        toAtt.copy(attractor).sub(pi).multiplyScalar(0.0035)
        vel[i].add(toAtt)
      }

      sep.multiplyScalar(0.1)
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

  return <instancedMesh ref={meshRef} args={[geo, mat, FISH_COUNT]} frustumCulled={false} />
}

function SeaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOUNDS_Y - 0.2, -4]} receiveShadow>
      <planeGeometry args={[140, 140, 32, 32]} />
      <meshStandardMaterial color="#0a3a4f" metalness={0.05} roughness={0.92} />
    </mesh>
  )
}

/** Volumetric god rays — additive cones with animated opacity */
function GodRays() {
  const refs = useRef<THREE.Mesh[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + (Math.sin(t * 0.6 + i) * 0.5 + 0.5) * 0.16
    })
  })
  const beams = useMemo(
    () => [
      { x: -8, z: -6, scale: 1.0 },
      { x: -3, z: -2, scale: 1.4 },
      { x: 2, z: -8, scale: 1.1 },
      { x: 6, z: -3, scale: 1.3 },
      { x: 9, z: -10, scale: 0.95 },
    ],
    [],
  )
  return (
    <group>
      {beams.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
          position={[b.x, 8, b.z]}
          rotation={[Math.PI, 0, 0]}
          scale={[b.scale, 1, b.scale]}
          renderOrder={-1}
        >
          <coneGeometry args={[2.4, 22, 24, 1, true]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Subtle camera parallax following the pointer */
function CameraRig() {
  const base = useMemo(() => new THREE.Vector3(-3.2, 1.4, 9.5), [])
  useFrame(({ camera, pointer }) => {
    const tx = base.x + pointer.x * 0.6
    const ty = base.y + pointer.y * 0.4
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.04)
    camera.lookAt(0, 0.3, 0)
  })
  return null
}

function ScrollResponder() {
  const { camera } = useThree()
  useFrame(() => {
    if (typeof window === 'undefined') return
    // push camera further into the scene as user scrolls past the hero
    const sy = Math.min(window.scrollY / window.innerHeight, 1.4)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, 1 + sy * 0.18, 0.08)
    camera.updateProjectionMatrix()
  })
  return null
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
    <spotLight
      ref={ref}
      position={[4, 16, 2]}
      angle={0.55}
      penumbra={0.85}
      intensity={2.4}
      color="#7dd3fc"
      castShadow={false}
    />
  )
}

function SceneContent() {
  // Diver paths — gentle sweeping curves that loop forever.
  const path1 = useMemo(
    () => [
      new THREE.Vector3(14, -3, -8),
      new THREE.Vector3(6, -1, -4),
      new THREE.Vector3(-2, 2, 0),
      new THREE.Vector3(-12, 4, 6),
      new THREE.Vector3(-16, 2, -4),
      new THREE.Vector3(-6, -2, -10),
      new THREE.Vector3(8, -3, -12),
    ],
    [],
  )
  const path2 = useMemo(
    () => [
      new THREE.Vector3(-14, -5, 4),
      new THREE.Vector3(-4, -3, 1),
      new THREE.Vector3(4, -1, -3),
      new THREE.Vector3(12, 1, -10),
      new THREE.Vector3(6, 3, -14),
      new THREE.Vector3(-6, 0, -10),
      new THREE.Vector3(-12, -3, -2),
    ],
    [],
  )

  return (
    <>
      <color attach="background" args={['#051a2c']} />
      <fog attach="fog" args={['#051a2c', 14, 56]} />

      {/* lights */}
      <ambientLight intensity={0.42} color="#7dd3fc" />
      <directionalLight position={[-6, 18, 4]} intensity={0.95} color="#e0f2fe" />
      <CausticLight />
      <pointLight position={[10, 2, -8]} intensity={1.1} color="#0aaddb" distance={40} decay={2} />

      {/* atmosphere */}
      <Stars radius={80} depth={40} count={900} factor={2.4} saturation={0} speed={0.25} />
      <Sparkles count={120} scale={[28, 14, 18]} position={[0, 1, -4]} size={2.2} speed={0.25} color="#bae6fd" opacity={0.6} />
      <Sparkles count={45} scale={[14, 6, 6]} position={[-2, 1.5, 4]} size={3} speed={0.4} color="#e0f2fe" opacity={0.85} />
      <GodRays />

      {/* ecosystem */}
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.35}>
        <BoidFishSchool />
      </Float>

      {/* divers */}
      <HeroDiver />
      <SwimmingDiver points={path1} speed={0.013} scale={0.85} tint="#16263a" startOffset={0.08} />
      <SwimmingDiver points={path2} speed={0.009} scale={0.7} tint="#1a2b3e" startOffset={0.55} />

      <SeaFloor />

      {/* camera */}
      <CameraRig />
      <ScrollResponder />
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
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [-3.2, 1.4, 9.5], fov: 42, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
