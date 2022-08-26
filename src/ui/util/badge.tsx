import "./badge.scss"

export const badge = (text?: string | number | true) => {
  if (text === undefined) {
    return undefined
  }

  if (typeof text === "number") {
    text = `${Math.min(text, 99)}${text > 99 ? "+" : ""}`
  }

  return {
    "data-has-badge": true,
    "data-badge": (typeof text === "string") ? text : undefined,
  }
}
