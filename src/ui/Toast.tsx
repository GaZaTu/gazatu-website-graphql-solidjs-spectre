import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(Toast, {
  createProps,
})
