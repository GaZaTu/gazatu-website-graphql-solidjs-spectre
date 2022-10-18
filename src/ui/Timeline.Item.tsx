import classnames from "classnames"
import { ComponentProps, JSX, splitProps } from "solid-js"
import A from "./A"
import "./Timeline.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  icon?: JSX.Element
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "timeline-item": true,
      })
    },
  }
})

function TimelineItem(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      <div class="timeline-left">
        <A class="timeline-icon" href={_props.id ? `#${_props.id}` : undefined}>
          {_props.icon ?? ""}
        </A>
      </div>
      <div class="timeline-content">
        {fml.children}
      </div>
    </div>
  )
}

export default Object.assign(TimelineItem, {
  createProps,
})
