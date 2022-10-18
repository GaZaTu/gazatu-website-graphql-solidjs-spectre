import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import Button from "./Button"
import "./Carousel.scss"
import Icon from "./Icon"
import iconArrowLeft from "./icons/iconArrowLeft"
import iconArrowRight from "./icons/iconArrowRight"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  prev?: boolean
  next?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "item-prev": props.prev,
        "item-next": props.next,
      })
    },
  }
})

function CarouselButton(props: Props & ComponentProps<typeof Button>) {
  // eslint-disable-next-line no-empty-pattern
  const [] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <Button size="lg" action {..._props}>
      <Icon src={_props.prev ? iconArrowLeft : iconArrowRight} />
    </Button>
  )
}

function CarouselButtonA(props: Props & ComponentProps<typeof Button.A>) {
  // eslint-disable-next-line no-empty-pattern
  const [] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <Button.A size="lg" action {..._props}>
      <Icon src={_props.prev ? iconArrowLeft : iconArrowRight} />
    </Button.A>
  )
}

export default Object.assign(CarouselButton, {
  createProps,
  A: CarouselButtonA,
})
