import { combineProps } from "@solid-primitives/props"
import { createMemo, JSX, splitProps } from "solid-js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createHTMLMemoHook = <P, R extends JSX.HTMLAttributes<any>>(fn: (props: P) => R) => {
  return function <PP extends P>(props: PP, defaults: Partial<PP> = {}) {
    const [fml, propsWithoutChildren] = splitProps(props as { children?: JSX.Element }, ["children"])
    const children = createMemo(() => fml.children)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsWithDefaults: PP = combineProps(defaults, propsWithoutChildren) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propsCombined: PP = combineProps(fn(propsWithDefaults), propsWithDefaults) as any

    return [propsCombined, children] as const
  }
}

export default createHTMLMemoHook
