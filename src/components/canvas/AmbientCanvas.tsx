import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'

import Bubbles from '@/components/canvas/Bubbles'
import FishSchool from '@/components/canvas/FishSchool'

interface Props {
  /** Number of fish */
  fishCount?: number
  /** Number of bubbles */
  bubbleCount?: number
  /** Tint of the school */
  fishColor?: string
  /** Show bubbles? */
  bubbles?: boolean
  /** Show plankton sparkles? */
  sparkles?: boolean
  /** Camera Z distance */
  cameraZ?: number
  /** FOV */
  fov?: number
}

/**
 * Lightweight reusable canvas for listing pages. Renders one boid school,
 * optional bubbles, plus sparkles. DPR is capped low because this lives in
 * sidebars / banners, not full-screen.
 *
 * Disabled under prefers-reduced-motion.
 */
export default function AmbientCanvas({
  fishCount = 28,
  bubbleCount = 50,
  fishColor = '#38bdf8',
  bubbles = true,
  sparkles = true,
  cameraZ = 6,
  fov = 50,
}: Props) {
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
      camera={{ position: [0, 0, cameraZ], fov, near: 0.1, far: 40 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#051a2c']} />
        <fog attach="fog" args={['#051a2c', 8, 24]} />
        <ambientLight intensity={0.55} color="#bae6fd" />
        <pointLight position={[3, 3, 4]} intensity={0.9} color="#7dd3fc" distance={20} />
        <FishSchool
          count={fishCount}
          speed={0.14}
          scale={0.85}
          bounds={[8, 4, 6]}
          centre={[0, 0, -2]}
          color={fishColor}
        />
        {bubbles && (
          <Bubbles count={bubbleCount} speed={0.6} bounds={[6, 8, 3]} centre={[0, 0, 0]} />
        )}
        {sparkles && (
          <Sparkles
            count={40}
            scale={[8, 5, 4]}
            position={[0, 0, -1]}
            size={2.2}
            speed={0.3}
            color="#bae6fd"
            opacity={0.7}
          />
        )}
      </Suspense>
    </Canvas>
  )
}
