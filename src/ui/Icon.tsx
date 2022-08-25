import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Icon.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  src: string
  size?: "1x" | "2x" | "3x" | "4x"
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "spectre-icon": true,
        [props.src]: true,
        [`icon-${props.size}`]: !!props.size,
      })
    },
  }
})

function Icon(props: Props & ComponentProps<"i">) {
  const [_props, _children] = createProps(props)

  return (
    <i {..._props}>
      {_children()}
    </i>
  )
}

export default Object.assign(Icon, {
  createProps,
})
