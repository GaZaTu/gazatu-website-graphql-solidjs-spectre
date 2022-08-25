import { ComponentProps } from "solid-js"
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

  // const context = useContext(NavbarContext)

  return (
    <span {..._props}>
      {_children()}

      {/* <NavbarBurger expanded={context.expanded()} onclick={() => {
        console.log("wtfrlick")
        context.setExpanded(p => !p)
      }} /> */}
    </span>
  )
}

export default Object.assign(NavbarBrand, {
  createProps,
})
