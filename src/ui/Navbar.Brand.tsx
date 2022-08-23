import { ComponentProps } from "solid-js"
import A from "./A"
import "./Navbar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "navbar-brand": true,
    },
  }
})

function NavbarBrand(props: Props & ComponentProps<"span">) {
  const [_props, _children] = createProps(props)

  return (
    <span {..._props}>
      {_children()}
    </span>
  )
}

function NavbarBrandAnchor(props: Props & ComponentProps<typeof A>) {
  const [_props, _children] = createProps(props)

  return (
    <A {..._props}>
      {_children()}
    </A>
  )
}

export default Object.assign(NavbarBrand, {
  createProps,
  A: NavbarBrandAnchor,
})
