import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeColor } from "./util/theming"

type Props = {
  color?: ThemeColor
  rounded?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "label": true,
        [`label-${props.color}`]: !!props.color,
        "label-rounded": props.rounded,
      })
    },
  }
})

function Label(props: Props & ComponentProps<"span">) {
  const [_props, _children] = createProps(props)

  return (
    <span {..._props}>
      {_children()}
    </span>
  )
}

export default Object.assign(Label, {
  createProps,
})
