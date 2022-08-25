import classnames from "classnames"
import { ComponentProps } from "solid-js"
import A from "./A"
import ButtonGroup from "./Button.Group"
import "./Button.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeColor, ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  color?: ThemeColor
  rounded?: boolean
  action?: boolean
  block?: boolean
  clear?: boolean
  outlined?: boolean
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "btn": true,
        [`btn-${props.size}`]: !!props.size,
        [`btn-${props.color}`]: !!props.color,
        "btn-rounded": props.rounded,
        "btn-action": props.action,
        "btn-block": props.block,
        "btn-clear": props.clear,
        "btn-outlined": props.outlined,
        "btn-active": props.active,
      })
    },
  }
})

function Button(props: Props & ComponentProps<"button">) {
  const [_props, _children] = createProps(props)

  return (
    <button {..._props}>
      {_children()}
    </button>
  )
}

function ButtonAnchor(props: Props & ComponentProps<typeof A>) {
  const [_props, _children] = createProps(props, { color: "link" })

  return (
    <A {..._props}>
      {_children()}
    </A>
  )
}

export default Object.assign(Button, {
  createProps,
  Group: ButtonGroup,
  A: ButtonAnchor,
})
