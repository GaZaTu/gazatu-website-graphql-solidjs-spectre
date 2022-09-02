import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Chip.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "chip": true,
        "active": props.active,
      })
    },
  }
})

function Chip(props: Props & ComponentProps<"span">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <span {..._props}>
      {fml.children}
    </span>
  )
}

export default Object.assign(Chip, {
  createProps,
})
