import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Section.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { createUtility, ThemeBreakpoint } from "./util/theming"

type Props = {
  left?: boolean
  size?: ThemeBreakpoint
  marginTop?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "container": true,
        "container-left": props.left,
        [`grid-${props.size}`]: !!props.size,
        "container-margin-top": props.marginTop,
      })
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
