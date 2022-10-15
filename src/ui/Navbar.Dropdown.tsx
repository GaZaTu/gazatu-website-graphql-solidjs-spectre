import { ComponentProps, splitProps } from "solid-js"
import Button from "./Button"
import Dropdown from "./Dropdown"
import Icon from "./Icon"
import iconArrowDown from "./icons/iconArrowDown"
import "./Navbar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  matchHref?: string
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {}
})

function NavbarDropdown(props: Props & ComponentProps<typeof Dropdown>) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  const [toggleProps, dropdownProps] = splitProps(_props, [
    "toggle",
    "matchHref",
  ])

  return (
    <Dropdown {...dropdownProps} toggle={toggle => (
      <Button.A color="link" match={toggleProps.matchHref ? { href: toggleProps.matchHref } : undefined} {...toggle}>
        <span>{toggleProps.toggle({})}</span>
        <Icon src={iconArrowDown} />
      </Button.A>
    )}>
      {fml.children}
    </Dropdown>
  )
}

export default Object.assign(NavbarDropdown, {
  createProps,
})
