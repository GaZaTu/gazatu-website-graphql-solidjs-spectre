import classnames from "classnames"
import { children, ComponentProps, createEffect, JSX, splitProps } from "solid-js"
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
    get class() {
      return classnames({
        "dropdown": true,
        "dropdown-right": props.right,
        "active": props.active,
        "dropdown-use-hover": props.useHover,
      })
    },
  }
})

function Dropdown(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  const [toggleProps, dropdownProps] = splitProps(_props, [
    "toggle",
  ])

  const resolvedToggle = children(() => toggleProps.toggle)
  createEffect(() => {
    const toggle = resolvedToggle() as HTMLElement
    if (!toggle) {
      return
    }

    toggle.tabIndex = 0
    toggle.dataset.dropdownToggle = "true"
  })

  return (
    <div {...dropdownProps}>
      {resolvedToggle()}
      {fml.children}
    </div>
  )
}

export default Object.assign(Dropdown, {
  createProps,
  Menu: Menu,
})
