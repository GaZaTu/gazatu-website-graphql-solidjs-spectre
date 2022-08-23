import { ComponentProps } from "solid-js"
import CardBody from "./Card.Body"
import CardFooter from "./Card.Footer"
import CardImage from "./Card.Image"
import "./Card.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "card": true,
    },
  }
})

function Card(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Card, {
  createProps,
  Body: CardBody,
  Footer: CardFooter,
  Header: CardFooter,
  Image: CardImage,
})
