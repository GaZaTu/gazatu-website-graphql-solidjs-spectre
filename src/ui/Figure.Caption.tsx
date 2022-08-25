import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Img.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "figure-caption": true,
      })
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
