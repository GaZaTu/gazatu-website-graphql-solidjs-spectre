import { Component, createEffect, createSignal } from "solid-js"
import A from "./ui/A"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import Column from "./ui/Column"
import Container from "./ui/Container"
import Dropdown from "./ui/Dropdown"
import Icon from "./ui/Icon"
import iconArrowDown from "./ui/icons/iconArrowDown"
import Img from "./ui/Img"
import Menu from "./ui/Menu"
import Navbar from "./ui/Navbar"
import { centerChildren } from "./ui/util/position"

const [showAppNav, setShowAppNav] = createSignal(true)
const useShowAppNavEffect = (show: boolean) => {
  createEffect(() => {
    setShowAppNav(show)

    return () => {
      setShowAppNav(true)
    }
  })
}
export {
  showAppNav,
  setShowAppNav,
  useShowAppNavEffect,
}

const AppNav: Component = () => {
  // useIsRouting()

  return (
    <Container size="xl" style={{ position: "sticky" }}>
      {showAppNav() && (
        <Navbar style={{ "min-height": "64px" }} filled>
          <Navbar.Section>
            <Navbar.Brand.A href="/" classList={{ ...centerChildren(true) }}>
              <Img src="/static/gazatu-xyz.nofont.min.svg" alt="gazatu.xyz logo" height={42} />
            </Navbar.Brand.A>

            <Dropdown toggle={(
              <Button.A color="link" match={{ href: "/trivia" }}>
                <span>Trivia</span>
                <Icon src={iconArrowDown} />
              </Button.A>
            )}>
              <Menu>
                <Menu.Item>
                  <A href="/trivia/questions" match={{ exact: "withQuery" }}>Questions</A>
                </Menu.Item>
                <Menu.Item>
                  <A href="/trivia/categories">Categories</A>
                </Menu.Item>
              </Menu>
            </Dropdown>

            <Button.A href="/trivia/questions" params={{ test: 123 }} match={{ exact: "withQuery" }}>Questions</Button.A>
          </Navbar.Section>

          <Navbar.Section>
            <Column.Row>
              <Column>
                <Button.A href="http://github.com/GaZaTu" color="primary" outlined>GitHub</Button.A>
              </Column>

              <Column classList={{ ...centerChildren(true) }}>
                <A href="/profile">
                  <Avatar initials="Ga" aria-label="profile" />
                </A>
              </Column>
            </Column.Row>
          </Navbar.Section>
        </Navbar>
      )}
    </Container>
  )
}

export default AppNav
