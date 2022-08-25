import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Hero.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "hero": true,
      })
    },
  }
})

function Hero(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      <div class="hero-body">
        {_children()}
      </div>
    </div>
  )
}

export default Object.assign(Hero, {
  createProps,
})
