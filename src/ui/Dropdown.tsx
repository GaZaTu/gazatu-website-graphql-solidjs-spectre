import classnames from "classnames"
import { Component, ComponentProps, splitProps } from "solid-js"
import "./Dropdown.scss"
import Menu from "./Menu"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  right?: boolean
  active?: boolean
  useHover?: boolean

  toggle: Component<any>
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

  return (
    <div {...dropdownProps}>
      {toggleProps.toggle({
        tabIndex: 0,
        "data-dropdown-toggle": "true",
      })}
      {fml.children}
    </div>
  )
}

export default Object.assign(Dropdown, {
  createProps,
  Menu: Menu,
})
