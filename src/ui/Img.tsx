import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <img {..._props}>
      {fml.children}
    </img>
  )
}

export default Object.assign(Img, {
  createProps,
})
