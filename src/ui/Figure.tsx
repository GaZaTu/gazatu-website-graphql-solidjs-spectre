import classnames from "classnames"
import { ComponentProps } from "solid-js"
import FigureCaption from "./Figure.Caption"
import "./Img.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "figure": true,
      })
    },
  }
})

function Figure(props: Props & ComponentProps<"figure">) {
  const [_props, _children] = createProps(props)

  return (
    <figure {..._props}>
      {_children()}
    </figure>
  )
}

export default Object.assign(Figure, {
  createProps,
  Caption: FigureCaption,
})
