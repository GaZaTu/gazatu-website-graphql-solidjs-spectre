import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Toast.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeColor } from "./util/theming"

type Props = {
  color?: ThemeColor
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "toast": true,
        [`toast-${props.color}`]: !!props.color,
      })
    },
  }
})

function Toast(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Toast, {
  createProps,
})
