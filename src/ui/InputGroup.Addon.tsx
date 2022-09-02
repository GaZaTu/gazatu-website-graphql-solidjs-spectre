import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "input-group-addon": true,
        [`addon-${props.size}`]: !!props.size,
      })
    },
  }
})

function InputGroupAddon(props: Props & ComponentProps<"span">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <span {..._props}>
      {fml.children}
    </span>
  )
}

export default Object.assign(InputGroupAddon, {
  createProps,
})
