import "./shapes.scss"
import { createUtility, ThemeSize2 } from "./theming"

export const rounded = createUtility((size: ThemeSize2 | undefined) => {
  return size ? `s-rounded-${size}` : undefined
})

export const circle = (yes: true | undefined) =>
  rounded(yes ? "xl" : undefined)
