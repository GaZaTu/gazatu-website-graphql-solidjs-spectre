import { combineProps } from "@solid-primitives/props"
import { JSX } from "solid-js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createHTMLMemoHook = <P, R extends JSX.HTMLAttributes<any>>(fn: (props: P) => R) => {
  return function <PP extends P>(props: PP, defaults: Partial<PP> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsWithDefaults: PP = combineProps(defaults, props) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsCombined: PP = combineProps(fn(propsWithDefaults), propsWithDefaults) as any

    return [propsCombined] as const
  }
}

export default createHTMLMemoHook
