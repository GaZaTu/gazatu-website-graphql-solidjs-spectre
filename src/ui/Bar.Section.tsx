import { ComponentProps } from "solid-js"
import "./Bar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { text } from "./util/text"

type Props = {
  percent?: number
  value?: number
  max?: number
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "bar-section": true,
      ...text("ellipsis"),
    },
  }
})

function BarSection(props: Props & ComponentProps<"span">) {
  const [_props, _children] = createProps(props)

  return (
    <span
      {..._props}
      style={(() => {
        const percent = props.percent ?? Math.floor((props.max ?? 1) / (props.value ?? 1))

        if (typeof props.style === "string") {
          return `${props.style} width: ${percent}%;`
        } else {
          return {
            ...props.style,
            width: `${percent}%`,
          }
        }
      })()}
      aria-valuenow={props.value}
      aria-valuemin={0}
      aria-valuemax={props.max}>
      {_children()}
    </span>
  )
}

export default Object.assign(BarSection, {
  createProps,
})
