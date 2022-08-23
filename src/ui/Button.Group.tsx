import { ComponentProps } from "solid-js"
import "./Button.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  rounded?: ThemeSize
  block?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "btn-group": true,
      [`btn-group-${props.size}`]: !!props.size,
      [`btn-group-rounded-${props.rounded}`]: !!props.rounded,
      "btn-group-block": props.block,
    },
  }
})

function ButtonGroup(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(ButtonGroup, {
  createProps,
})
