import { ComponentProps } from "solid-js"
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
  const [_props, _children] = createProps(props)

  return (
    <Dropdown {..._props} toggle={(
      <Button.A color="link" match={_props.matchHref ? { href: _props.matchHref } : undefined}>
        <span>{_props.toggle}</span>
        <Icon src={iconArrowDown} />
      </Button.A>
    )}>
      {_children()}
    </Dropdown>
  )
}

export default Object.assign(NavbarDropdown, {
  createProps,
})
