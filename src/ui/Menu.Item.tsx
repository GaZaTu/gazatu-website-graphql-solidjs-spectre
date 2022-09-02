import classnames from "classnames"
import { ComponentProps, JSX, splitProps } from "solid-js"
import "./Menu.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
  disabled?: boolean
  focused?: boolean
  badge?: JSX.Element
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "menu-item": true,
        "active": props.active,
        "disabled": props.disabled,
        "focused": props.focused,
      })
    },
  }
})

function MenuItem(props: Props & ComponentProps<"li">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <li {..._props}>
      {fml.children}
      {props.badge && (
        <span class="menu-badge">{props.badge}</span>
      )}
    </li>
  )
}

export default Object.assign(MenuItem, {
  createProps,
})
