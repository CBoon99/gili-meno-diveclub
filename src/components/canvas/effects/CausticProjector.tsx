import { useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { causticFragment, causticVertex } from '@/lib/caustic-shader'

interface Props {
  position?: [number, number, number]
  targetPosition?: [number, number, number]
  intensity?: number
  angle?: number
  color?: string
  /** Texture resolution. 256 looks great, 384 = crisper at small extra cost. */
  resolution?: number
}

/**
 * Renders the caustic shader to an off-screen FBO every frame and uses it as
 * the cookie texture of a downward-pointing SpotLight. Receivers (anything
 * lit by this light: sea floor, divers, fish) get animated caustic ripples
 * projected onto them while keeping their PBR materials intact.
 */
export default function CausticProjector({
  position = [0, 16, 0],
  targetPosition = [0, -8, 0],
  intensity = 3.4,
  angle = 0.95,
  color = '#bae6fd',
  resolution = 256,
}: Props) {
  const fbo = useFBO(resolution, resolution, { depth: false })

  const fboCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2),
    [],
  )
  const fboScene = useMemo(() => new THREE.Scene(), [])
  const matRef = useRef<THREE.ShaderMaterial | null>(null)
  const lightRef = useRef<THREE.SpotLight | null>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.85 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: causticVertex,
      fragmentShader: causticFragment,
      depthTest: false,
      depthWrite: false,
    })
    matRef.current = mat
    const mesh = new THREE.Mesh(geo, mat)
    fboScene.add(mesh)
    return () => {
      fboScene.remove(mesh)
      geo.dispose()
      mat.dispose()
    }
  }, [color, fboScene])

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    state.gl.setRenderTarget(fbo)
    state.gl.render(fboScene, fboCamera)
    state.gl.setRenderTarget(null)

    if (lightRef.current) {
      if (lightRef.current.map !== fbo.texture) lightRef.current.map = fbo.texture
      if (targetRef.current && lightRef.current.target !== targetRef.current) {
        lightRef.current.target = targetRef.current
      }
    }
  })

  return (
    <>
      <spotLight
        ref={lightRef}
        position={position}
        angle={angle}
        penumbra={0.95}
        intensity={intensity}
        distance={60}
        decay={1.2}
        color={color}
        castShadow={false}
      />
      <object3D ref={targetRef} position={targetPosition} />
    </>
  )
}
