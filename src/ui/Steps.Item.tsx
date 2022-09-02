import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Steps.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "steps-item": true,
        "active": props.active,
      })
    },
  }
})

function StepsItem(props: Props & ComponentProps<"li">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <li {..._props}>
      {fml.children}
    </li>
  )
}

export default Object.assign(StepsItem, {
  createProps,
})
