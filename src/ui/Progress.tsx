import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Progress.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  fixedTop?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "progress": true,
        "progress-fixed-top": props.fixedTop,
      })
    },
  }
})

function Progress(props: Props & ComponentProps<"progress">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <progress {..._props}>
      {fml.children}
    </progress>
  )
}

export default Object.assign(Progress, {
  createProps,
})
