import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Nav.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "nav-item": true,
        "active": props.active,
      })
    },
  }
})

function NavItem(props: Props & ComponentProps<"li">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <li {..._props}>
      {fml.children}
    </li>
  )
}

export default Object.assign(NavItem, {
  createProps,
})
