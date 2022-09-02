import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <Dynamic component={_props.snippet ? "pre" : "code"} {..._props} data-lang={_props.lang}>
      {fml.children}
    </Dynamic>
  )
}

export default Object.assign(Code, {
  createProps,
})
