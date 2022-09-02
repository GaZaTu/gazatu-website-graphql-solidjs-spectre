import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Tile.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "tile-title": true,
      })
    },
  }
})

function TileTitle(props: Props & ComponentProps<"p">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <p {..._props}>
      {fml.children}
    </p>
  )
}

export default Object.assign(TileTitle, {
  createProps,
})
