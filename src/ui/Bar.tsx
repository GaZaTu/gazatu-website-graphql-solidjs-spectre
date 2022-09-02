import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
    get class() {
      return classnames({
        "bar": true,
        "bar-slider": props.slider,
        [`bar-${props.size}`]: !!props.size,
      })
    },
  }
})

function Bar(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {fml.children}
    </div>
  )
}

export default Object.assign(Bar, {
  createProps,
  Section: BarSection,
})
