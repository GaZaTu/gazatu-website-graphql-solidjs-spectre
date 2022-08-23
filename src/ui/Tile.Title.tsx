import { ComponentProps } from "solid-js"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tile-title": true,
    },
  }
})

function TileTitle(props: Props & ComponentProps<"p">) {
  const [_props, _children] = createProps(props)

  return (
    <p {..._props}>
      {_children()}
    </p>
  )
}

export default Object.assign(TileTitle, {
  createProps,
})
