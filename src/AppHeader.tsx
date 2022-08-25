import { Component, createEffect, createSignal } from "solid-js"
import A from "./ui/A"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import Column from "./ui/Column"
import Img from "./ui/Img"
import Menu from "./ui/Menu"
import Navbar from "./ui/Navbar"
import Section from "./ui/Section"
import { badge } from "./ui/util/badge"

const [showAppHeader, setShowAppHeader] = createSignal(true)
const useShowAppNavEffect = (show: boolean) => {
  createEffect(() => {
    setShowAppHeader(show)

    return () => {
      setShowAppHeader(true)
    }
  })
}

export {
  showAppHeader,
  setShowAppHeader,
  useShowAppNavEffect,
}

const AppNav: Component = () => {
  const [expanded, setExpanded] = createSignal(false)

  // useIsRouting()

  return (
    <Navbar id="AppHeader" class="testxd" size="lg" filled style={{ display: !showAppHeader() ? "none" : undefined }} responsive expanded={expanded()}>
      <Section size="xl" style={{ position: "sticky" }}>
        <Navbar.Section>
          <Navbar.Brand>
            <A href="/">
              <Img src="/static/gazatu-xyz.nofont.min.svg" alt="gazatu.xyz logo" height={36} />
            </A>

            <Navbar.Burger class="test" expanded={expanded()} onclick={() => setExpanded(v => !v)} />
          </Navbar.Brand>

          <Navbar.Dropdown toggle={<span {...badge(1)}>Trivia</span>} matchHref="/trivia">
            <Menu>
              <Menu.Item>
                <A href="/trivia/questions" match>Questions</A>
              </Menu.Item>
              <Menu.Item>
                <A href="/trivia/categories" match>Categories</A>
              </Menu.Item>
            </Menu>
          </Navbar.Dropdown>

          <Button.A href="/trivia/questions" params={{ test: 123 }} match={{ exact: "withQuery" }}>Questions</Button.A>
          <Button.A href="/trivia/categories" params={{ test: 123 }} match={{ exact: "withQuery" }}>Categories</Button.A>
        </Navbar.Section>

        <Navbar.Section>
          <Column.Row>
            <Column>
              <Button.A href="http://github.com/GaZaTu" color="primary" outlined>GitHub</Button.A>
            </Column>

            <Column>
              <A href="/profile">
                <Avatar initials="Ga" aria-label="profile" />
              </A>
            </Column>
          </Column.Row>
        </Navbar.Section>
      </Section>
    </Navbar>
  )
}

export default AppNav
