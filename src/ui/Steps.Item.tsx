import { ComponentProps } from "solid-js"
import "./Steps.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "steps-item": true,
      "active": props.active,
    },
  }
})

function StepsItem(props: Props & ComponentProps<"li">) {
  const [_props, _children] = createProps(props)

  return (
    <li {..._props}>
      {_children()}
    </li>
  )
}

export default Object.assign(StepsItem, {
  createProps,
})
