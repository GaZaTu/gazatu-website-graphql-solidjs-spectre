import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Panel.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "panel-nav": true,
      })
    },
  }
})

function PanelNav(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {_children()}
    </section>
  )
}

export default Object.assign(PanelNav, {
  createProps,
})
