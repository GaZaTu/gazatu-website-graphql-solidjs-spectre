export type ThemeSize = "sm" | "md" | "lg"

export type ThemeSize2 = "xs" | "sm" | "md" | "lg" | "xl"

export type ThemeColor = "primary" | "secondary" | "success" | "warning" | "failure" | "link" | "gray"

export type ThemeBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl"

export const createUtility = <A extends unknown[]>(fn: (...a: A) => string | undefined) => {
  return (...a: A) => {
    const className = fn(...a)

    const result = {
      [className ?? ""]: !!className,
    }

    Object.defineProperty(result, "toString", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: () => className ?? "",
    })

    return result
  }
}
