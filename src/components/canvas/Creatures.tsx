import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Reef shark silhouette — orbits in the deep background. Always partially
 * obscured by fog, so it reads as "something big out there". Low-poly.
 */
export function SharkSilhouette() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.045
    if (!group.current) return
    group.current.position.x = Math.cos(t) * 24
    group.current.position.z = Math.sin(t) * 22 - 14
    group.current.position.y = -2.6 + Math.sin(t * 4) * 0.4
    // tangent of the circle: heading direction
    const heading = Math.atan2(Math.cos(t) * 22, -Math.sin(t) * 24)
    group.current.rotation.y = heading + Math.PI / 2
    // tail wag
    const tail = group.current.children[1] as THREE.Object3D | undefined
    if (tail) tail.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.4
  })
  return (
    <group ref={group}>
      {/* body */}
      <mesh scale={[1, 0.55, 3.6]}>
        <sphereGeometry args={[0.7, 14, 10]} />
        <meshStandardMaterial color="#0b1626" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* tail (animated) */}
      <group position={[0, 0, -2.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.7, 1.2, 4]} />
          <meshStandardMaterial color="#0b1626" roughness={0.85} />
        </mesh>
      </group>
      {/* dorsal fin */}
      <mesh position={[0, 0.6, 0.2]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.18, 0.9, 4]} />
        <meshStandardMaterial color="#0b1626" />
      </mesh>
      {/* pectoral fins */}
      <mesh position={[0.7, -0.1, 0.4]} rotation={[0, 0, -0.6]} scale={[1.2, 0.06, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#0b1626" />
      </mesh>
      <mesh position={[-0.7, -0.1, 0.4]} rotation={[0, 0, 0.6]} scale={[1.2, 0.06, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#0b1626" />
      </mesh>
    </group>
  )
}

/**
 * Sea turtle drifting past — performs one slow pass every ~75s, then is
 * "off-screen" again. Animated flippers. Conservation-themed cameo.
 */
export function DriftingTurtle({ cycleSeconds = 75 }: { cycleSeconds?: number }) {
  const group = useRef<THREE.Group>(null)
  const fl = useRef<THREE.Object3D[]>([])

  useFrame((state) => {
    if (!group.current) return
    const t = (state.clock.elapsedTime % cycleSeconds) / cycleSeconds
    // Travel from right → left of the scene, slight depth oscillation
    const x = THREE.MathUtils.lerp(18, -22, t)
    const y = 0.8 + Math.sin(t * Math.PI * 2) * 0.6
    const z = -3 + Math.sin(t * Math.PI) * 4
    group.current.position.set(x, y, z)
    group.current.rotation.y = -Math.PI / 2 + Math.sin(t * Math.PI * 6) * 0.06
    group.current.rotation.z = Math.sin(t * Math.PI * 2) * 0.12

    // Hide the turtle outside its visible window so it doesn't pop in lighting
    const visible = t > 0.05 && t < 0.95
    group.current.visible = visible

    // Flap flippers
    const flap = Math.sin(state.clock.elapsedTime * 1.6)
    fl.current.forEach((m, i) => {
      if (!m) return
      const dir = i < 2 ? 1 : -1
      m.rotation.z = (i % 2 === 0 ? 0.3 : -0.3) + flap * 0.45 * dir
    })
  })

  return (
    <group ref={group} scale={1.1}>
      {/* shell */}
      <mesh scale={[1.4, 0.55, 1.0]}>
        <sphereGeometry args={[0.7, 18, 14]} />
        <meshStandardMaterial color="#3d4a35" metalness={0.08} roughness={0.62} />
      </mesh>
      {/* head */}
      <mesh position={[0.85, -0.05, 0]} scale={[0.42, 0.32, 0.32]}>
        <sphereGeometry args={[0.7, 14, 12]} />
        <meshStandardMaterial color="#4a5a40" roughness={0.65} />
      </mesh>
      {/* front flippers */}
      <mesh
        ref={(el) => {
          if (el) fl.current[0] = el
        }}
        position={[0.45, -0.2, 0.6]}
        scale={[0.55, 0.07, 0.28]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#3d4a35" />
      </mesh>
      <mesh
        ref={(el) => {
          if (el) fl.current[1] = el
        }}
        position={[0.45, -0.2, -0.6]}
        scale={[0.55, 0.07, 0.28]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#3d4a35" />
      </mesh>
      {/* rear flippers */}
      <mesh
        ref={(el) => {
          if (el) fl.current[2] = el
        }}
        position={[-0.55, -0.18, 0.45]}
        scale={[0.4, 0.06, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#3d4a35" />
      </mesh>
      <mesh
        ref={(el) => {
          if (el) fl.current[3] = el
        }}
        position={[-0.55, -0.18, -0.45]}
        scale={[0.4, 0.06, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#3d4a35" />
      </mesh>
    </group>
  )
}
