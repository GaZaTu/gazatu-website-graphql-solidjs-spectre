import { ComponentProps } from "solid-js"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tile-subtitle": true,
    },
  }
})

function TileSubtitle(props: Props & ComponentProps<"p">) {
  const [_props, _children] = createProps(props)

  return (
    <p {..._props}>
      {_children()}
    </p>
  )
}

export default Object.assign(TileSubtitle, {
  createProps,
})
