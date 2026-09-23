import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  CameraControls,
  Environment,
  Float,
  Gltf,
  Html,
  useGLTF,
} from '@react-three/drei'
import { degToRad } from 'three/src/math/MathUtils.js'
import { CLASSROOM_MODEL, ENVIRONMENT_MAP, preloadTeacher } from './assets'
import { Board } from './Board'
import { Teacher } from './Teacher'
import { useTutor } from './useTutor'

// The camera sits at the origin and only turns/zooms, like a student at a desk
const CAMERA = {
  idle: { position: [0, 0, 0.0001], zoom: 1 },
  thinking: { position: [0.0000262, 0.0000052, 0.0000964], zoom: 1.3 },
  speaking: { position: [0, -0.00000016, 0.0001], zoom: 1.75 },
}

function CameraRig() {
  const controls = useRef()
  const phase = useTutor((state) => state.phase)

  useEffect(() => {
    const target = CAMERA[phase] || CAMERA.idle
    controls.current?.setPosition(...target.position, true)
    controls.current?.zoomTo(target.zoom, true)
  }, [phase])

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{ left: 1, middle: 0, right: 0, wheel: 16 }}
      touches={{ one: 32, two: 512, three: 0 }}
    />
  )
}

export function Classroom() {
  const teacher = useTutor((state) => state.teacher)

  return (
    <Canvas camera={{ position: CAMERA.idle.position }} dpr={[1, 1.5]}>
      <CameraRig />

      {/* Bundled locally so the room is lit without an internet connection */}
      <Suspense fallback={null}>
        <Environment files={ENVIRONMENT_MAP} />
      </Suspense>
      <ambientLight intensity={0.8} color="pink" />

      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        <Html position={[0.22, 0.192, -3]} transform distanceFactor={0.5}>
          <Board />
        </Html>

        <Suspense fallback={null}>
          <Teacher
            key={teacher}
            teacher={teacher}
            position={[-1, -1.7, -3]}
            scale={1.5}
            rotation-y={degToRad(20)}
          />
        </Suspense>

        <Suspense fallback={null}>
          <Gltf src={CLASSROOM_MODEL} position={[0.2, -1.7, -1]} />
        </Suspense>
      </Float>
    </Canvas>
  )
}

// Only the teacher last used is fetched up front; the others load when picked
useGLTF.preload(CLASSROOM_MODEL)
preloadTeacher(useTutor.getState().teacher)
