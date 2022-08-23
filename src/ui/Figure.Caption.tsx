import { ComponentProps } from "solid-js"
import "./Img.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "figure-caption": true,
    },
  }
})

function FigureCaption(props: Props & ComponentProps<"figcaption">) {
  const [_props, _children] = createProps(props)

  return (
    <figcaption {..._props}>
      {_children()}
    </figcaption>
  )
}

export default Object.assign(FigureCaption, {
  createProps,
})
