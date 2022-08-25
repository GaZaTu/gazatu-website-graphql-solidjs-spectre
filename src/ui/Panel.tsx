import classnames from "classnames"
import { ComponentProps } from "solid-js"
import CardBody from "./Card.Body"
import CardFooter from "./Card.Footer"
import CardImage from "./Card.Image"
import "./Panel.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "panel": true,
      })
    },
  }
})

function Panel(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Panel, {
  createProps,
  Body: CardBody,
  Footer: CardFooter,
  Header: CardFooter,
  Image: CardImage,
})
