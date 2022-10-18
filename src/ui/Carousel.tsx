import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import CarouselButton from "./Carousel.Button"
import "./Carousel.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "carousel": true,
      })
    },
  }
})

function Carousel(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <div {..._props}>
      <div class="carousel-container">
        <figure class="carousel-item checked">
          {fml.children}
        </figure>
      </div>
    </div>
  )
}

export default Object.assign(Carousel, {
  createProps,
  Button: CarouselButton,
})
