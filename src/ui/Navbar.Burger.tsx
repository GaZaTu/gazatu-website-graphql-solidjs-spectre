import { ComponentProps, createMemo } from "solid-js"
import Button from "./Button"
import Icon from "./Icon"
import iconCross from "./icons/iconCross"
import iconMenu from "./icons/iconMenu"
import "./Navbar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  expanded?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "navbar-burger": true,
    },
  }
})

function NavbarBurger(props: Props & ComponentProps<typeof Button>) {
  const [_props] = createProps(props)

  const icon = createMemo(() => {
    return props.expanded ? iconCross : iconMenu
  })

  return (
    <Button {..._props} color="link">
      <Icon src={icon()} />
    </Button>
  )
}

export default Object.assign(NavbarBurger, {
})
