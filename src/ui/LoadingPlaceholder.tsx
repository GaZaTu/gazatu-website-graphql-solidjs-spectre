import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./LoadingPlaceholder.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  width?: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  height?: string | number
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "loading-placeholder": true,
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
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      <div class="loading-placeholder-gradient">
        {_children()}
      </div>
    </div>
  )
}

export default Object.assign(LoadingPlaceholder, {
  createProps,
})
