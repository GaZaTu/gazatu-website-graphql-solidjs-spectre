import { combineProps } from "@solid-primitives/props"
import { createMemo, JSX, mergeProps, splitProps } from "solid-js"
import createMemoStore from "./createMemoStore"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createHTMLMemoHook = <P, R extends JSX.HTMLAttributes<any>>(fn: (props: P) => R) => {
  return function <PP extends P>(props: PP, defaults: Partial<PP> = {}) {
    // eslint-disable-next-line solid/reactivity
    const propsWithDefaults = mergeProps(defaults, props) as PP
    const propsForControl = createMemoStore(() => fn(propsWithDefaults))
    const propsCombined = combineProps(propsForControl, propsWithDefaults)
    const [xd, propsCombinedWithoutChildren] = splitProps(propsCombined, ["children"])
    const children = createMemo(() => (xd as { children?: JSX.Element }).children)

    return [propsCombinedWithoutChildren, children] as const
  }
}

export default createHTMLMemoHook
