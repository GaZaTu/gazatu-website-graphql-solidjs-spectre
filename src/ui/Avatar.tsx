import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Avatar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize2 } from "./util/theming"

type Props = {
  size?: ThemeSize2

  imageSrc?: string
  imageAlt?: string
  initials?: string
  iconImageSrc?: string
  iconImageAlt?: string
  presence?: "offline" | "online" | "busy" | "away"
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "avatar": true,
        [`avatar-${props.size}`]: !!props.size,
      })
    },
  }
})

function Avatar(props: Props & ComponentProps<"figure">) {
  const [_props, _children] = createProps(props)

  return (
    <figure {..._props} data-initials={props.initials}>
      {props.imageSrc && (
        <img src={props.imageSrc} alt={props.imageAlt} />
      )}
      {props.iconImageSrc && (
        <img class="avatar-icon" src={props.imageSrc} alt={props.iconImageSrc} />
      )}
      {props.presence && (
        <i class={`avatar-presence ${props.presence}`} />
      )}
      {_children()}
    </figure>
  )
}

export default Object.assign(Avatar, {
  createProps,
})
