import { ComponentProps } from "solid-js"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {}
})

function A(props: Props & ComponentProps<"a">) {
  const [_props, _children] = createProps(props)

  return (
    <a {..._props}>
      {_children()}
    </a>
  )
}

export default Object.assign(A, {
  createProps,
})
