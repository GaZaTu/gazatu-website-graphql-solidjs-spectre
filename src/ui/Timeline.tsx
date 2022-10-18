import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import TimelineItem from "./Timeline.Item"
import "./Timeline.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "timeline": true,
      })
    },
  }
})

function Timeline(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(Timeline, {
  createProps,
  Item: TimelineItem,
})
