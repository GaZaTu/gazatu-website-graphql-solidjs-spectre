import { ComponentProps } from "solid-js"
import Icon from "./Icon"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  iconSrc?: ComponentProps<typeof Icon>["src"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tile-icon": true,
    },
  }
})

function TileIcon(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {props.iconSrc && (
        <div class="tile-icon-box">
          <Icon src={props.iconSrc} />
        </div>
      )}
      {_children()}
    </section>
  )
}

export default Object.assign(TileIcon, {
  createProps,
})
