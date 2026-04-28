import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { BlendFunction, KernelSize } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import FishSchool from '@/components/canvas/FishSchool'
import { DriftingTurtle, SharkSilhouette } from '@/components/canvas/Creatures'
import CausticProjector from '@/components/canvas/effects/CausticProjector'

const BOUNDS = 22
const BOUNDS_Y = 10

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ============================================================
 * Diver primitives
 * ============================================================ */

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

/**
 * Cinematic intro diver. Swims in along a Catmull-Rom curve from the deep
 * right, scaling up as they approach, then transitions to a relaxed hover
 * next to the headline. Driven by GSAP for the intro, then handed off to
 * useFrame for the idle loop. Optionally drives a `cameraOffset` ref that
 * a `CameraRig` reads to dolly the camera back during the swim-in.
 */
function IntroDiver({
  groupRef,
  cameraOffset,
  onSettled,
}: {
  groupRef?: React.MutableRefObject<THREE.Group | null>
  cameraOffset?: React.MutableRefObject<{ z: number }>
  onSettled?: () => void
} = {}) {
  const localRef = useRef<THREE.Group>(null)
  const group = (groupRef ?? localRef) as React.MutableRefObject<THREE.Group | null>
  const phase = useRef<'intro' | 'transition' | 'idle'>('intro')
  const progress = useRef({ value: 0 })

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(11, -7, -14),
          new THREE.Vector3(8, -4.5, -7),
          new THREE.Vector3(5, -2, -2),
          new THREE.Vector3(2.5, -0.6, 1.5),
          new THREE.Vector3(1.4, -0.3, 2.6),
        ],
        false,
        'catmullrom',
        0.3,
      ),
    [],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const lookTmp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!group.current) return

    // Start far away and tiny
    curve.getPointAt(0, tmp)
    group.current.position.copy(tmp)
    group.current.scale.setScalar(0.35)

    const tl = gsap.timeline({ delay: 0.35 })

    tl.to(
      progress.current,
      {
        value: 1,
        duration: 5.2,
        ease: 'power2.inOut',
      },
      0,
    )
      .to(
        group.current.scale,
        {
          x: 1.55,
          y: 1.55,
          z: 1.55,
          duration: 5.2,
          ease: 'power2.inOut',
        },
        0,
      )

    if (cameraOffset) {
      tl.to(
        cameraOffset.current,
        {
          z: 0,
          duration: 5.2,
          ease: 'power2.out',
        },
        0,
      )
    }

    tl.add(() => {
      phase.current = 'transition'
    })
      // Smoothly normalise the body orientation
      .to(
        group.current.rotation,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        '>-0.05',
      )
      .add(() => {
        phase.current = 'idle'
        onSettled?.()
      })

    return () => {
      tl.kill()
    }
  }, [curve, tmp, onSettled, cameraOffset])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime

    if (phase.current === 'intro') {
      curve.getPointAt(progress.current.value, tmp)
      group.current.position.copy(tmp)

      const ahead = Math.min(progress.current.value + 0.04, 1)
      curve.getPointAt(ahead, lookTmp)
      group.current.lookAt(lookTmp)
      group.current.rotateX(Math.PI / 2)

      // body wobble while swimming
      group.current.rotation.z += Math.sin(t * 4) * 0.07
    } else if (phase.current === 'idle') {
      group.current.position.y = -0.3 + Math.sin(t * 0.55) * 0.35
      group.current.rotation.y = Math.sin(t * 0.22) * 0.12
      group.current.rotation.z = Math.sin(t * 0.31) * 0.06
    }
    // transition phase: GSAP owns rotation; position is frozen at curve end
  })

  return (
    <group ref={group}>
      <DiverMesh scale={1} />
    </group>
  )
}

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

/* ============================================================
 * Static scene props
 * ============================================================ */

function SeaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOUNDS_Y - 0.2, -4]} receiveShadow>
      <planeGeometry args={[160, 160, 64, 64]} />
      <meshStandardMaterial color="#0a3a4f" metalness={0.05} roughness={0.92} />
    </mesh>
  )
}

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

/* ============================================================
 * Camera + scroll
 * ============================================================ */

function CameraRig({
  scrollProgress,
  cameraOffset,
}: {
  scrollProgress: React.RefObject<number>
  cameraOffset?: React.MutableRefObject<{ z: number }>
}) {
  const base = useMemo(() => new THREE.Vector3(-3.2, 1.4, 9.5), [])
  useFrame(({ camera, pointer }) => {
    const sy = scrollProgress.current ?? 0
    const dolly = cameraOffset?.current?.z ?? 0
    // Descend on scroll: camera y drops, fov widens slightly, target tilts down
    const tx = base.x + pointer.x * 0.6
    const ty = base.y + pointer.y * 0.4 - sy * 4.5
    const tz = base.z + sy * 1.2 + dolly
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.04)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.04)
    camera.lookAt(0, 0.3 - sy * 4, 0)
    if ('zoom' in camera) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, 1 + sy * 0.18, 0.08)
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/**
 * Bubble trail that emits behind a tracked Three.js Group (the diver).
 * Uses a fixed pool of instances; spawns faster while `intro.current === true`
 * (during the swim-in), then a slower drip during idle so the diver still
 * "breathes out" bubbles realistically.
 */
function DiverBubbleTrail({
  targetRef,
  intro,
}: {
  targetRef: React.MutableRefObject<THREE.Group | null>
  intro: React.MutableRefObject<boolean>
}) {
  const COUNT = 38
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => new THREE.SphereGeometry(0.06, 10, 10), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color('#7dd3fc'),
        emissiveIntensity: 0.55,
        depthWrite: false,
      }),
    [],
  )

  const bubbles = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        size: 0,
      })),
    [],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const off = useMemo(() => new THREE.Vector3(0, -1000, 0), [])
  const lastSpawn = useRef(0)

  useFrame((state, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime

    const interval = intro.current ? 0.06 : 0.35
    if (targetRef.current && t - lastSpawn.current > interval) {
      const idle = bubbles.find((b) => b.life <= 0)
      if (idle) {
        idle.pos.copy(targetRef.current.position)
        idle.pos.x += -0.4 + Math.random() * 0.8
        idle.pos.y += 0.4 + Math.random() * 0.35
        idle.pos.z += -0.3 + Math.random() * 0.6
        idle.vel.set(
          (Math.random() - 0.5) * 0.4,
          0.65 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.4,
        )
        idle.maxLife = 2.6 + Math.random() * 1.6
        idle.life = idle.maxLife
        idle.size = 0.45 + Math.random() * 1.6
      }
      lastSpawn.current = t
    }

    bubbles.forEach((b, i) => {
      if (b.life <= 0) {
        dummy.position.copy(off)
        dummy.scale.setScalar(0)
      } else {
        b.life -= dt
        b.pos.addScaledVector(b.vel, dt)
        b.vel.x *= 0.95
        b.vel.z *= 0.95
        const ratio = Math.max(b.life / b.maxLife, 0)
        const fade = ratio < 0.25 ? ratio / 0.25 : 1
        const grow = 0.55 + (1 - ratio) * 0.55
        dummy.position.copy(b.pos)
        dummy.scale.setScalar(b.size * grow * fade)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, COUNT]} frustumCulled={false} />
}

/** Drives fog colour / range by scroll progress to feel like descending */
function DepthMood({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const { scene } = useThree()
  const colourA = useMemo(() => new THREE.Color('#051a2c'), [])
  const colourB = useMemo(() => new THREE.Color('#01060d'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const sy = scrollProgress.current ?? 0
    if (!scene.fog) return
    const fog = scene.fog as THREE.Fog
    fog.near = THREE.MathUtils.lerp(fog.near, 14 - sy * 8, 0.06)
    fog.far = THREE.MathUtils.lerp(fog.far, 56 - sy * 26, 0.06)
    tmp.copy(colourA).lerp(colourB, sy)
    fog.color.lerp(tmp, 0.06)
    if ('background' in scene && scene.background instanceof THREE.Color) {
      scene.background.lerp(tmp, 0.06)
    }
  })
  return null
}

/* ============================================================
 * Scene composition
 * ============================================================ */

function SceneContent({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const heroDiverRef = useRef<THREE.Group>(null)
  const introActive = useRef(true)
  const cameraOffset = useRef({ z: 1.9 })

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
      <pointLight position={[10, 2, -8]} intensity={1.1} color="#0aaddb" distance={40} decay={2} />

      {/* projected caustics — animated procedural cookie on a SpotLight */}
      <CausticProjector position={[0, 16, -2]} targetPosition={[0, -8, -2]} intensity={3.4} angle={0.95} />

      {/* atmosphere */}
      <Stars radius={80} depth={40} count={900} factor={2.4} saturation={0} speed={0.25} />
      <Sparkles count={140} scale={[28, 14, 18]} position={[0, 1, -4]} size={2.4} speed={0.25} color="#bae6fd" opacity={0.6} />
      <Sparkles count={45} scale={[14, 6, 6]} position={[-2, 1.5, 4]} size={3} speed={0.4} color="#e0f2fe" opacity={0.85} />
      <GodRays />

      {/* TWO fish species ----------------------------------- */}
      {/* Blue fusiliers — large, fast school, attracted toward H1 */}
      <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.3}>
        <FishSchool
          count={120}
          speed={0.16}
          scale={1}
          bounds={[BOUNDS, BOUNDS_Y, BOUNDS]}
          centre={[0, 0, -4]}
          color="#38bdf8"
          emissive="#0c4a63"
          attractor={[-3.5, 1.6, 1.2]}
          attractorStrength={0.0035}
        />
      </Float>
      {/* Yellow snappers — slower, smaller school, deeper background */}
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.4}>
        <FishSchool
          count={32}
          speed={0.12}
          scale={1.4}
          bounds={[14, 5, 10]}
          centre={[6, -1, -10]}
          color="#facc15"
          emissive="#7a4f0a"
        />
      </Float>

      {/* divers */}
      <IntroDiver
        groupRef={heroDiverRef}
        cameraOffset={cameraOffset}
        onSettled={() => {
          introActive.current = false
        }}
      />
      <DiverBubbleTrail targetRef={heroDiverRef} intro={introActive} />
      <SwimmingDiver points={path1} speed={0.013} scale={0.85} tint="#16263a" startOffset={0.08} />
      <SwimmingDiver points={path2} speed={0.009} scale={0.7} tint="#1a2b3e" startOffset={0.55} />

      {/* big creatures */}
      <SharkSilhouette />
      <DriftingTurtle cycleSeconds={75} />

      <SeaFloor />

      <CameraRig scrollProgress={scrollProgress} cameraOffset={cameraOffset} />
      <DepthMood scrollProgress={scrollProgress} />
    </>
  )
}

/* ============================================================
 * Component
 * ============================================================ */

export default function HeroUnderwater() {
  const [enableScene, setEnableScene] = useState(false)
  const scrollProgress = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEnableScene(false)
      return
    }
    setEnableScene(true)

    const onScroll = () => {
      if (typeof window === 'undefined') return
      const denom = Math.max(window.innerHeight, 1)
      scrollProgress.current = THREE.MathUtils.clamp(window.scrollY / denom, 0, 1.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setEnableScene(!mq.matches)
    mq.addEventListener('change', onChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', onChange)
    }
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
          <SceneContent scrollProgress={scrollProgress} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.45}
              kernelSize={KernelSize.LARGE}
              mipmapBlur
            />
            <Vignette
              offset={0.2}
              darkness={0.55}
              blendFunction={BlendFunction.NORMAL}
              eskil={false}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
