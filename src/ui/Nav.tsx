import classnames from "classnames"
import { ComponentProps } from "solid-js"
import NavItem from "./Nav.Item"
import "./Nav.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "nav": true,
      })
    },
  }
})

function Nav(props: Props & ComponentProps<"ul">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <ul {..._props}>
      {fml.children}
    </ul>
  )
}

export default Object.assign(Nav, {
  createProps,
  Item: NavItem,
})
