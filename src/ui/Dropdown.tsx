import { children, ComponentProps, createEffect, JSX } from "solid-js"
import "./Dropdown.scss"
import Menu from "./Menu"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  right?: boolean
  active?: boolean
  useHover?: boolean

  toggle: JSX.Element
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "dropdown": true,
      "dropdown-right": props.right,
      "active": props.active,
      "dropdown-use-hover": props.useHover,
    },
  }
})

function Dropdown(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  const resolvedToggle = children(() => props.toggle)
  createEffect(() => {
    const toggle = resolvedToggle() as HTMLElement

    toggle.tabIndex = 0
    toggle.classList.add("dropdown-toggle")
  })

  return (
    <div {..._props}>
      {resolvedToggle()}
      {_children()}
    </div>
  )
}

export default Object.assign(Dropdown, {
  createProps,
  Menu: Menu,
})
