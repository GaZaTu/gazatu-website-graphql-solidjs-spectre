import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./LoadingPlaceholder.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  inline?: boolean

  width?: string | number
  height?: string | number
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "loading-placeholder": true,
        "inline": props.inline,
      })
    },
    get style() {
      return {
        width: (typeof props.width === "number") ? `${props.width}px` : props.width,
        height: (typeof props.height === "number") ? `${props.height}px` : props.height,
      }
    },
  }
})

function LoadingPlaceholder(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      <div class="loading-placeholder-gradient">
        {fml.children}
      </div>
    </div>
  )
}

export default Object.assign(LoadingPlaceholder, {
  createProps,
})
