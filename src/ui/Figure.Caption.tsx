import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <figcaption {..._props}>
      {fml.children}
    </figcaption>
  )
}

export default Object.assign(FigureCaption, {
  createProps,
})
