import classnames from "classnames"
import { ComponentProps, JSX } from "solid-js"
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
  const [_props, _children] = createProps(props)

  return (
    <li {..._props}>
      {_children()}
      {props.badge && (
        <span class="menu-badge">{props.badge}</span>
      )}
    </li>
  )
}

export default Object.assign(MenuItem, {
  createProps,
})
