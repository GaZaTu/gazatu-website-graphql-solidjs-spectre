import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
    get class() {
      return classnames({
        "btn-group": true,
        [`btn-group-${props.size}`]: !!props.size,
        [`btn-group-rounded-${props.rounded}`]: !!props.rounded,
        "btn-group-block": props.block,
      })
    },
  }
})

function ButtonGroup(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(ButtonGroup, {
  createProps,
})
