import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import MenuItem from "./Menu.Item"
import "./Menu.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  transparent?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "menu": true,
        "menu-nav": props.transparent,
      })
    },
  }
})

function Menu(props: Props & ComponentProps<"ul">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <ul {..._props}>
      {fml.children}
    </ul>
  )
}

export default Object.assign(Menu, {
  createProps,
  Item: MenuItem,
})
