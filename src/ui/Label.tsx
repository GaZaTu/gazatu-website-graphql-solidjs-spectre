import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeColor } from "./util/theming"

type Props = {
  color?: ThemeColor
  round?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "label": true,
        [`label-${props.color}`]: !!props.color,
        "label-rounded": props.round,
      })
    },
  }
})

function Label(props: Props & ComponentProps<"span">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <span {..._props}>
      {fml.children}
    </span>
  )
}

export default Object.assign(Label, {
  createProps,
})
