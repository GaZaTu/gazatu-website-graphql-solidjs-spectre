import { ComponentProps, JSX } from "solid-js"
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
    classList: {
      "popover": true,
      [`popover-${props.direction}`]: !!props.direction,
    },
  }
})

function Popover(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {props.toggle}
      <div class="popover-container">
        {_children()}
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
