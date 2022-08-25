import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Navbar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  // center?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "navbar-section": true,
        // "navbar-center": props.center,
      })
    },
  }
})

function NavbarSection(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  return (
    <section {..._props}>
      {_children()}
    </section>
  )
}

export default Object.assign(NavbarSection, {
  createProps,
})
