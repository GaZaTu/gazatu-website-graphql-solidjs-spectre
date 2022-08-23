import { ComponentProps } from "solid-js"
import "./Bar.scss"
import BarSection from "./Bar.Section"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

// TODO: https://picturepan2.github.io/spectre/components/bars.html#bars-slider

type Props = {
  slider?: boolean
  size?: "sm" | "lg"
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "bar": true,
      "bar-slider": props.slider,
      [`bar-${props.size}`]: !!props.size,
    },
  }
})

function Bar(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Bar, {
  createProps,
  Section: BarSection,
})
