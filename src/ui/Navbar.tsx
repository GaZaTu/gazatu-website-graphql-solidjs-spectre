import { ComponentProps } from "solid-js"
import NavbarBrand from "./Navbar.Brand"
import "./Navbar.scss"
import NavbarSection from "./Navbar.Section"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  compact?: boolean
  filled?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "navbar": true,
      "navbar-compact": props.compact,
      "navbar-filled": props.filled,
    },
  }
})

function Navbar(props: Props & ComponentProps<"header">) {
  const [_props, _children] = createProps(props)

  return (
    <header {..._props}>
      {_children()}
    </header>
  )
}

export default Object.assign(Navbar, {
  createProps,
  Section: NavbarSection,
  Brand: NavbarBrand,
})
