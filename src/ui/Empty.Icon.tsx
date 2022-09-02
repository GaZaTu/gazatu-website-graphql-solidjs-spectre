import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Empty.scss"
import Icon from "./Icon"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  iconSrc?: ComponentProps<typeof Icon>["src"]
  iconSize?: ComponentProps<typeof Icon>["size"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "empty-icon": true,
      })
    },
  }
})

function EmptyIcon(props: Props & ComponentProps<"section">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <section {..._props}>
      {props.iconSrc && (
        <Icon src={props.iconSrc} size={props.iconSize ?? "3x"} />
      )}
      {fml.children}
    </section>
  )
}

export default Object.assign(EmptyIcon, {
  createProps,
})
