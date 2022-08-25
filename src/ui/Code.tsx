import classnames from "classnames"
import { ComponentProps } from "solid-js"
import { Dynamic } from "solid-js/web"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  snippet?: boolean

  lang?: string
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "code": props.snippet,
      })
    },
  }
})

function Code(props: Props & ComponentProps<"code" | "pre">) {
  const [_props, _children] = createProps(props)

  return (
    <Dynamic component={props.snippet ? "pre" : "code"} {...props} data-lang={props.lang}>
      {_children()}
    </Dynamic>
  )
}

export default Object.assign(Code, {
  createProps,
})
