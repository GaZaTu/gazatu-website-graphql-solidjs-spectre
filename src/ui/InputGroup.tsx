import { ComponentProps } from "solid-js"
import InputGroupAddon from "./InputGroup.Addon"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "input-group": true,
      [`input-group-${props.size}`]: !!props.size,
    },
  }
})

function InputGroup(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(InputGroup, {
  createProps,
  Addon: InputGroupAddon,
})
