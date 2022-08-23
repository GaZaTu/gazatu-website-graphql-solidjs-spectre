import { ComponentProps } from "solid-js"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tile-body": true,
      "xd": false,
    },
  }
})

function TileBody(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {_children()}
    </section>
  )
}

export default Object.assign(TileBody, {
  createProps,
})
