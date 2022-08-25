import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Card.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "card-header": true,
      })
    },
  }
})

function CardHeader(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {_children()}
    </section>
  )
}

export default Object.assign(CardHeader, {
  createProps,
})
