import { useGLTF } from '@react-three/drei'

const ASSETS = `${import.meta.env.BASE_URL}tutor3d`

export const CLASSROOM_MODEL = `${ASSETS}/models/classroom_default.glb`
export const ENVIRONMENT_MAP = `${ASSETS}/venice_sunset_1k.hdr`

export const teacherModel = (teacher) =>
  `${ASSETS}/models/Teacher_${teacher}.glb`
export const teacherAnimations = (teacher) =>
  `${ASSETS}/models/animations_${teacher}.glb`
export const teacherImage = (teacher) => `${ASSETS}/images/${teacher}.jpg`

export function preloadTeacher(teacher) {
  useGLTF.preload(teacherModel(teacher))
  useGLTF.preload(teacherAnimations(teacher))
}
