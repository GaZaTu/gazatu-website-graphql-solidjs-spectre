import { ComponentProps } from "solid-js"
import MenuItem from "./Menu.Item"
import "./Menu.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  transparent?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "menu": true,
      "menu-nav": props.transparent,
    },
  }
})

function Menu(props: Props & ComponentProps<"ul">) {
  const [_props, _children] = createProps(props)

  return (
    <ul {..._props}>
      {_children()}
    </ul>
  )
}

export default Object.assign(Menu, {
  createProps,
  Item: MenuItem,
})
