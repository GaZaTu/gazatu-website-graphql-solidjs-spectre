import classnames from "classnames"
import { ComponentProps, createMemo } from "solid-js"
import Button from "./Button"
import Icon from "./Icon"
import "./Navbar.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  expanded?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "navbar-burger": true,
      })
    },
  }
})

function NavbarBurger(props: Props & ComponentProps<typeof Button>) {
  const [_props] = createProps(props)

  const icon = createMemo(() => {
    return props.expanded ? Icon.Context.iconCross : Icon.Context.iconMenu
  })

  return (
    <Button {..._props} color="link">
      <Icon src={icon()} />
    </Button>
  )
}

export default Object.assign(NavbarBurger, {
})
