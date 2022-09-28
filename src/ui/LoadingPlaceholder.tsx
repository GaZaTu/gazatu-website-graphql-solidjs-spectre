import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./LoadingPlaceholder.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  inline?: boolean

  width?: string | number
  height?: string | number

  style2?: ComponentProps<"div">["style"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "loading-placeholder": true,
        "inline": props.inline,
      })
    },
  }
})

function LoadingPlaceholder(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props} style={{
      ...(props.style2 as any),
      width: (typeof props.width === "number") ? `${props.width}px` : props.width,
      height: (typeof props.height === "number") ? `${props.height}px` : props.height,
    }}>
      <div class="loading-placeholder-gradient">
        {fml.children}
      </div>
    </div>
  )
}

export default Object.assign(LoadingPlaceholder, {
  createProps,
})
