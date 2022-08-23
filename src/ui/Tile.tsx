import { ComponentProps } from "solid-js"
import TileAction from "./Tile.Action"
import TileBody from "./Tile.Body"
import TileIcon from "./Tile.Icon"
import "./Tile.scss"
import TileSubtitle from "./Tile.Subtitle"
import TileTitle from "./Tile.Title"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  compact?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tile": true,
      "tile-centered": props.compact,
    },
  }
})

function Tile(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {_children()}
    </div>
  )
}

export default Object.assign(Tile, {
  createProps,
  Action: TileAction,
  Body: TileBody,
  Icon: TileIcon,
  Subtitle: TileSubtitle,
  Title: TileTitle,
})
