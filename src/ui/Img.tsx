import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Img.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  responsive?: boolean
  fit?: "contain" | "cover"
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "img-responsive": props.responsive,
        [`img-fit-${props.fit}`]: !!props.fit,
      })
    },
  }
})

function Img(props: Props & ComponentProps<"img">) {
  const [_props, _children] = createProps(props)

  return (
    <img {..._props}>
      {_children()}
    </img>
  )
}

export default Object.assign(Img, {
  createProps,
})
