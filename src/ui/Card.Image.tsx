import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Card.scss"
import Img from "./Img"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  src?: string
  alt?: string
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "card-image": true,
      })
    },
  }
})

function CardImage(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {props.src && (
        <Img src={props.src} alt={props.alt} responsive />
      )}
      {_children()}
    </section>
  )
}

export default Object.assign(CardImage, {
  createProps,
})
