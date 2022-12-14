import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Divider.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { text } from "./util/text"

type Props = {
  vertical?: boolean
  textCenter?: boolean

  label?: string
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "divider": !props.vertical,
        "divider-vert": props.vertical,
        ...text(props.textCenter ? "center" : undefined),
      })
    },
  }
})

function Divider(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props} data-content={props.label}>
      {fml.children}
    </div>
  )
}

export default Object.assign(Divider, {
  createProps,
})
