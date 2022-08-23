import "./text.scss"
import { createUtility } from "./theming"

type Option = "left" | "center" | "right" | "justify" | "lowercase" | "uppercase" | "capitalize" | "smallcaps" | "normal" | "bold" | "italic" | "muted" | "large" | "small" | "tiny" | "ellipsis" | "clip" | "break"

export const text = createUtility((option: Option | undefined) => {
  return option ? `text-${option}` : undefined
})
