import classnames from "classnames"
import { ComponentProps, JSX, splitProps } from "solid-js"
import CardBody from "./Card.Body"
import CardFooter from "./Card.Footer"
import CardImage from "./Card.Image"
import "./Popover.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  direction?: "bottom" | "top" | "left" | "right"

  toggle?: JSX.Element
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "popover": true,
        [`popover-${props.direction}`]: !!props.direction,
      })
    },
  }
})

function Popover(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      {props.toggle}
      <div class="popover-container">
        {fml.children}
      </div>
    </div>
  )
}

export default Object.assign(Popover, {
  createProps,
  Body: CardBody,
  Footer: CardFooter,
  Header: CardFooter,
  Image: CardImage,
})
