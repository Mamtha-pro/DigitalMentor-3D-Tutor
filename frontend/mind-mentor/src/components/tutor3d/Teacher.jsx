import { useEffect, useMemo, useRef, useState } from 'react'
import { Html, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils, MeshStandardMaterial } from 'three'
import { teacherAnimations, teacherModel } from './assets'
import { getActiveViseme } from './speech'
import { useTutor } from './useTutor'

const ANIMATION_FADE = 0.5

const numericMouth = Array.from({ length: 22 }, (_, id) => String(id))

// Elliot's mouth is rigged with named shapes instead of viseme ids, so each
// viseme is mapped onto the closest shape he has.
const ELLIOT_SHAPES = {
  1: ['A', 0.8], 2: ['A', 1], 3: ['O', 0.9], 4: ['E', 0.8], 5: ['W,R', 0.7],
  6: ['E', 1], 7: ['U,Q', 1], 8: ['O', 1], 9: ['A', 0.9], 10: ['O', 0.9],
  11: ['A', 1], 12: ['A', 0.35], 13: ['W,R', 0.9], 14: ['L,N', 1],
  15: ['T.S', 1], 16: ['T.S', 0.8], 17: ['T.S', 0.6], 18: ['F.V', 1],
  19: ['L,N', 0.8], 20: ['E', 0.4], 21: ['M,B,P', 1],
}

const RIGS = {
  Abbi: {
    mouth: numericMouth,
    shapeFor: (viseme) => [String(viseme), 1],
    blink: ['eye_close'],
    smile: null,
  },
  Alfie: {
    mouth: numericMouth,
    shapeFor: (viseme) => [String(viseme), 1],
    blink: ['eye_close'],
    smile: 'mouthSmile',
  },
  Elliot: {
    mouth: [...new Set(Object.values(ELLIOT_SHAPES).map(([name]) => name))],
    shapeFor: (viseme) => ELLIOT_SHAPES[viseme] || [null, 0],
    blink: [],
    smile: null,
  },
}

// Frame-rate independent version of lerp(current, target, k) per 60fps frame
const ease = (k, delta) => 1 - Math.pow(1 - k, delta * 60)

export function Teacher({ teacher, ...props }) {
  const group = useRef()
  const rig = RIGS[teacher] || RIGS.Abbi

  const { scene } = useGLTF(teacherModel(teacher))
  const { animations } = useGLTF(teacherAnimations(teacher))
  const { actions, mixer } = useAnimations(animations, group)

  const phase = useTutor((state) => state.phase)
  const [talkingClip, setTalkingClip] = useState('Talking')
  const [blink, setBlink] = useState(false)

  const animation =
    phase === 'thinking'
      ? 'Thinking'
      : phase === 'speaking'
        ? talkingClip
        : 'Idle'

  // Same treatment as the original 3D mentor: plain lit materials that keep
  // only the colour texture. Done once per cached scene.
  useEffect(() => {
    if (scene.userData.tutorMaterials) return
    scene.traverse((child) => {
      if (child.material) {
        child.material = new MeshStandardMaterial({ map: child.material.map })
      }
    })
    scene.userData.tutorMaterials = true
  }, [scene])

  const morphMeshes = useMemo(() => {
    const meshes = []
    scene.traverse((child) => {
      if (child.morphTargetDictionary && child.morphTargetInfluences) {
        meshes.push(child)
      }
    })
    return meshes
  }, [scene])

  useEffect(() => {
    let blinkTimer
    let openTimer
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        setBlink(true)
        openTimer = setTimeout(() => {
          setBlink(false)
          scheduleBlink()
        }, 110)
      }, MathUtils.randInt(1200, 5000))
    }
    scheduleBlink()
    return () => {
      clearTimeout(blinkTimer)
      clearTimeout(openTimer)
    }
  }, [])

  const swappingClip = useRef(false)

  useEffect(() => {
    const action = actions[animation]
    action
      ?.reset()
      .fadeIn(mixer.time > 0 ? ANIMATION_FADE : 0)
      .play()
    swappingClip.current = false
    return () => {
      action?.fadeOut(ANIMATION_FADE)
    }
  }, [animation, actions, mixer])

  const setMorph = (name, value, k, delta) => {
    for (const mesh of morphMeshes) {
      const index = mesh.morphTargetDictionary[name]
      if (index === undefined) continue
      mesh.morphTargetInfluences[index] = MathUtils.lerp(
        mesh.morphTargetInfluences[index],
        value,
        ease(k, delta),
      )
    }
  }

  useFrame((_, delta) => {
    if (rig.smile) setMorph(rig.smile, 0.2, 0.5, delta)
    for (const name of rig.blink) setMorph(name, blink ? 1 : 0, 0.5, delta)

    const speaking = phase === 'speaking'
    const [activeShape, weight] = speaking
      ? rig.shapeFor(getActiveViseme())
      : [null, 0]

    for (const name of rig.mouth) {
      if (name === activeShape) setMorph(name, weight, 0.3, delta)
      else setMorph(name, 0, 0.18, delta)
    }

    // Alternate the two talking clips so long answers don't visibly loop
    const action = actions[animation]
    if (
      speaking &&
      action &&
      !swappingClip.current &&
      action.time > action.getClip().duration - ANIMATION_FADE
    ) {
      swappingClip.current = true
      setTalkingClip((current) =>
        current === 'Talking' ? 'Talking2' : 'Talking',
      )
    }
  })

  return (
    <group {...props} dispose={null} ref={group}>
      {phase === 'thinking' && (
        <Html position-y={1.8} center>
          <ThinkingBubble />
        </Html>
      )}
      <primitive object={scene} />
    </group>
  )
}

function ThinkingBubble() {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(
      () => setDots((current) => (current.length === 3 ? '.' : `${current}.`)),
      450,
    )
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="relative flex h-9 w-9 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c1ff72] opacity-70" />
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[#c1ff72] text-sm font-bold text-black">
        {dots}
      </span>
    </span>
  )
}
