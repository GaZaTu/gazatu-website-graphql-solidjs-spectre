import "./position.scss"
import { createUtility } from "./theming"

export const float = createUtility((dir: "clear" | "left" | "right" | undefined) => {
  return (dir !== undefined) ? `float-${dir}` : undefined
})

export const centerSelf = createUtility((yes: true | undefined) => {
  return (yes !== undefined) ? "p-centered" : undefined
})

export const centerChildren = createUtility((yes: true | undefined) => {
  return (yes !== undefined) ? "flex-centered" : undefined
})

type Unit = 0 | 1 | 2

export const margin = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `m-${unit}` : undefined
})

export const marginT = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `mt-${unit}` : undefined
})

export const marginB = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `mb-${unit}` : undefined
})

export const marginL = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `ml-${unit}` : undefined
})

export const marginR = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `mr-${unit}` : undefined
})

export const marginX = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `mx-${unit}` : undefined
})

export const marginY = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `my-${unit}` : undefined
})

export const padding = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `p-${unit}` : undefined
})

export const paddingT = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `pt-${unit}` : undefined
})

export const paddingB = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `pb-${unit}` : undefined
})

export const paddingL = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `pl-${unit}` : undefined
})

export const paddingR = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `pr-${unit}` : undefined
})

export const paddingX = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `px-${unit}` : undefined
})

export const paddingY = createUtility((unit: Unit | undefined) => {
  return (unit !== undefined) ? `py-${unit}` : undefined
})
