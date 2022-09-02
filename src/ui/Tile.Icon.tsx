import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import Icon from "./Icon"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  iconSrc?: ComponentProps<typeof Icon>["src"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "tile-icon": true,
      })
    },
  }
})

function TileIcon(props: Props & ComponentProps<"section">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <section {..._props}>
      {props.iconSrc && (
        <div class="tile-icon-box">
          <Icon src={props.iconSrc} />
        </div>
      )}
      {fml.children}
    </section>
  )
}

export default Object.assign(TileIcon, {
  createProps,
})
