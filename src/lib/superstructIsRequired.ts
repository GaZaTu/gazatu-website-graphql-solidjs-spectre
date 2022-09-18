import { Struct } from "superstruct"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const superstructIsRequired = (validator: Struct<any, any>, path = "") => {
  const struct = path.split(".")
    .reduce((s, p) => {
      if (!p) {
        return s
      }

      if (!isNaN(Number(p))) {
        return s.schema
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (s.schema as Record<string, any>)[p]
    }, validator)
  if (!struct) {
    return false
  }

  const nullable = (() => {
    try {
      struct.create(null)
      return true
    } catch {
      return false
    }
  })()

  const optional = (() => {
    try {
      struct.create(undefined)
      return true
    } catch {
      return false
    }
  })()

  const required = (!optional && !nullable)
  return required
}

export default superstructIsRequired
