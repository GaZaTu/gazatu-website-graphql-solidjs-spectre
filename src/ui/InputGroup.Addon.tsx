import { ComponentProps } from "solid-js"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "input-group-addon": true,
      [`addon-${props.size}`]: !!props.size,
    },
  }
})

function InputGroupAddon(props: Props & ComponentProps<"span">) {
  const [_props, _children] = createProps(props)

  return (
    <span {..._props}>
      {_children()}
    </span>
  )
}

export default Object.assign(InputGroupAddon, {
  createProps,
})