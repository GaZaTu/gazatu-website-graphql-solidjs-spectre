import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
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
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <section {..._props}>
      {fml.children}
    </section>
  )
}

export default Object.assign(NavbarSection, {
  createProps,
})
