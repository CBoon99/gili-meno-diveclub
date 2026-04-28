import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  count?: number
  /** Rise rate (units per second) */
  speed?: number
  bounds?: [number, number, number]
  centre?: [number, number, number]
  /** Min/max bubble radius */
  size?: [number, number]
  emissive?: string
  /** Wobble amplitude horizontally */
  wobble?: number
}

/**
 * Reusable rising-bubble particle field. Spheres with additive-ish glow,
 * fade in as they leave the bottom and shrink/fade out near the top.
 */
export default function Bubbles({
  count = 120,
  speed = 0.6,
  bounds = [10, 14, 4],
  centre = [0, 0, 0],
  size = [0.05, 0.42],
  emissive = '#7dd3fc',
  wobble = 0.15,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const geo = useMemo(() => new THREE.SphereGeometry(1, 12, 12), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e0f2fe',
        metalness: 0.85,
        roughness: 0.05,
        transparent: true,
        opacity: 0.55,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.5,
        depthWrite: false,
      }),
    [emissive],
  )

  const seeds = useMemo(() => {
    const [bx, by, bz] = bounds
    const [cx, cy, cz] = centre
    const [s0, s1] = size
    return Array.from({ length: count }, () => {
      return {
        x: cx + (Math.random() - 0.5) * bx,
        baseY: cy - by / 2 - Math.random() * 2,
        z: cz + (Math.random() - 0.5) * bz,
        speed: speed * (0.6 + Math.random() * 0.9),
        size: s0 + Math.random() * (s1 - s0),
        offset: Math.random() * 12,
        wobble: wobble * (0.4 + Math.random() * 1.2),
        wobbleSpeed: 1 + Math.random() * 1.6,
        cycle: by + 4 + Math.random() * 2,
      }
    })
  }, [bounds, centre, count, size, speed, wobble])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      const phase = ((t * s.speed + s.offset) % s.cycle) / s.cycle // 0..1
      const y = s.baseY + phase * s.cycle
      const x = s.x + Math.sin((t + s.offset) * s.wobbleSpeed) * s.wobble
      // grow + fade so bubbles aren't constant-sized dots
      const grow = 0.35 + phase * 1.0
      dummy.position.set(x, y, s.z)
      dummy.scale.setScalar(s.size * grow)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />
}
