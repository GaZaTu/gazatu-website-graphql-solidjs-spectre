import { combineProps } from "@solid-primitives/props"
import { JSX } from "solid-js"

const createHTMLMemoHook = <P, R extends JSX.HTMLAttributes<any>>(fn: (props: P) => R) => {
  return function <PP extends P>(props: PP, defaults: Partial<PP> = {}) {
    const propsWithDefaults: PP = combineProps(defaults, props as any) as any
    const propsCombined: PP = combineProps(fn(propsWithDefaults), propsWithDefaults as any) as any

    return [propsCombined] as const
  }
}

export default createHTMLMemoHook
