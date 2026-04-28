import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  count?: number
  /** Base swim speed cap */
  speed?: number
  /** Body half-length scale */
  scale?: number
  bounds?: [number, number, number]
  centre?: [number, number, number]
  color?: string
  emissive?: string
  /** Optional attractor (e.g. near the H1) — fish drift toward it weakly */
  attractor?: [number, number, number]
  /** Per-frame influence from the attractor */
  attractorStrength?: number
}

/**
 * Reusable boid school. Used in the hero, listing canvases, and (later) any
 * decorative scene. Handles separation / alignment / cohesion + soft attractor.
 */
export default function FishSchool({
  count = 60,
  speed = 0.16,
  scale = 1,
  bounds = [22, 9, 18],
  centre = [0, 0, -2],
  color = '#38bdf8',
  emissive = '#0c4a63',
  attractor,
  attractorStrength = 0.0035,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const geo = useMemo(() => new THREE.ConeGeometry(0.12 * scale, 0.36 * scale, 5), [scale])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.3,
        roughness: 0.32,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.45,
      }),
    [color, emissive],
  )

  const data = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const vel: THREE.Vector3[] = []
    const [bx, by, bz] = bounds
    const [cx, cy, cz] = centre
    for (let i = 0; i < count; i++) {
      pos.push(
        new THREE.Vector3(
          cx + (Math.random() - 0.5) * bx * 1.6,
          cy + (Math.random() - 0.5) * by,
          cz + (Math.random() - 0.5) * bz,
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
  }, [bounds, centre, count])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const sep = useMemo(() => new THREE.Vector3(), [])
  const push = useMemo(() => new THREE.Vector3(), [])
  const ali = useMemo(() => new THREE.Vector3(), [])
  const coh = useMemo(() => new THREE.Vector3(), [])
  const att = useMemo(() => (attractor ? new THREE.Vector3(...attractor) : null), [attractor])
  const toAtt = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    const { pos, vel } = data
    const minSep = 1.0 * scale
    const sight = 4.5 * scale
    const [bx, by, bz] = bounds
    const [cx, cy, cz] = centre

    for (let i = 0; i < count; i++) {
      sep.set(0, 0, 0)
      ali.set(0, 0, 0)
      coh.set(0, 0, 0)
      let n = 0
      const pi = pos[i]

      for (let j = 0; j < count; j++) {
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

      if (att && i % 4 === 0) {
        toAtt.copy(att).sub(pi).multiplyScalar(attractorStrength)
        vel[i].add(toAtt)
      }

      sep.multiplyScalar(0.1)
      vel[i].add(sep).add(ali).add(coh)
      if (vel[i].length() > speed) vel[i].normalize().multiplyScalar(speed)

      pi.addScaledVector(vel[i], dt * 42)

      // soft bounds — keep school inside the volume
      if (Math.abs(pi.x - cx) > bx) {
        pi.x = cx + Math.sign(pi.x - cx) * bx
        vel[i].x *= -0.6
      }
      if (Math.abs(pi.y - cy) > by * 0.85) {
        pi.y = cy + Math.sign(pi.y - cy) * by * 0.85
        vel[i].y *= -0.6
      }
      if (Math.abs(pi.z - cz) > bz) {
        pi.z = cz + Math.sign(pi.z - cz) * bz
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

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />
}
