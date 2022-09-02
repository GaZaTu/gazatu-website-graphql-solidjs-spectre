import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import NavbarBrand from "./Navbar.Brand"
import NavbarBurger from "./Navbar.Burger"
import NavbarDropdown from "./Navbar.Dropdown"
import "./Navbar.scss"
import NavbarSection from "./Navbar.Section"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  size?: "sm" | "lg"
  filled?: boolean
  padded?: boolean
  responsive?: boolean
  expanded?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "navbar": true,
        [`navbar-${props.size}`]: !!props.size,
        "navbar-filled": props.filled,
        "navbar-padded": props.padded,
        "navbar-responsive": props.responsive,
        "navbar-expanded": props.expanded,
      })
    },
  }
})

function Navbar(props: Props & ComponentProps<"header">) {
  // const [context, setContext] = createStore({
  //   expanded: false,
  // })

  // const setExpanded: Setter<boolean> = v => {
  //   setContext(context => ({
  //     ...context,
  //     expanded: (() => {
  //       if (typeof v === "function") {
  //         return v(context.expanded)
  //       } else {
  //         return v
  //       }
  //     })(),
  //   }))

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   return undefined as any
  // }

  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <header {..._props}>
      {/* <NavbarContext.Provider value={{ expanded: () => context.expanded, setExpanded }}> */}
        {fml.children}
      {/* </NavbarContext.Provider> */}
    </header>
  )
}

function NavbarFooter(props: Props & ComponentProps<"footer">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <footer {..._props}>
      {fml.children}
    </footer>
  )
}

export default Object.assign(Navbar, {
  createProps,
  AsFooter: NavbarFooter,
  Section: NavbarSection,
  Brand: NavbarBrand,
  Dropdown: NavbarDropdown,
  Burger: NavbarBurger,
})
