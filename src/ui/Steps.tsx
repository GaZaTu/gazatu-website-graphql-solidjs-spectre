import { ComponentProps } from "solid-js"
import StepsItem from "./Steps.Item"
import "./Steps.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "steps": true,
    },
  }
})

function Steps(props: Props & ComponentProps<"ul">) {
  const [_props, _children] = createProps(props)

  return (
    <ul {..._props}>
      {_children()}
    </ul>
  )
}

export default Object.assign(Steps, {
  createProps,
  Item: StepsItem,
})