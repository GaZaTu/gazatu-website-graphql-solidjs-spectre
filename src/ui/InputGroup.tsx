import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import InputGroupAddon from "./InputGroup.Addon"
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
        "input-group": true,
        [`input-group-${props.size}`]: !!props.size,
      })
    },
  }
})

function InputGroup(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(InputGroup, {
  createProps,
  Addon: InputGroupAddon,
})
