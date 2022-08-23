import { ComponentProps } from "solid-js"
import "./Progress.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "progress": true,
    },
  }
})

function Progress(props: Props & ComponentProps<"progress">) {
  const [_props, _children] = createProps(props)

  return (
    <progress {..._props}>
      {_children()}
    </progress>
  )
}

export default Object.assign(Progress, {
  createProps,
})
