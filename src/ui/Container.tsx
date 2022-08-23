import { ComponentProps } from "solid-js"
import "./Column.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { createUtility, ThemeBreakpoint, ThemeSize2 } from "./util/theming"

type Props = {
  left?: boolean
  size?: ThemeSize2
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "container": true,
      "container-left": props.left,
      [`grid-${props.size}`]: !!props.size,
    },
  }
})

function Container(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {_children()}
    </section>
  )
}

export default Object.assign(Container, {
  createProps,
})

export const hide = createUtility((breakpoint: ThemeBreakpoint | undefined) => {
  return breakpoint ? `hide-${breakpoint}` : undefined
})

export const show = createUtility((breakpoint: ThemeBreakpoint | undefined) => {
  return breakpoint ? `show-${breakpoint}` : undefined
})
