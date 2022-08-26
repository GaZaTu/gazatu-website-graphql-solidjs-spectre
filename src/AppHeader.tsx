import { Component, createEffect, createSignal } from "solid-js"
import A from "./ui/A"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import Column from "./ui/Column"
import ImgWithPlaceholder from "./ui/ImgWithPlaceholder"
import Label from "./ui/Label"
import Menu from "./ui/Menu"
import Navbar from "./ui/Navbar"
import GlobalProgress from "./ui/Progress.Global"
import Section from "./ui/Section"
import Switch from "./ui/Switch"
import { badge } from "./ui/util/badge"
import { resolvedColorScheme, setColorScheme } from "./ui/util/colorScheme"

const [showAppHeader, setShowAppHeader] = createSignal(true)
const useShowAppHeaderEffect = (show: boolean) => {
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
  useShowAppHeaderEffect,
}

const AppNav: Component = () => {
  const [expanded, setExpanded] = createSignal(false)

  return (
    <Navbar id="AppHeader" size="lg" filled style={{ display: !showAppHeader() ? "none" : undefined }} responsive expanded={expanded()}>
      <GlobalProgress />

      <Section size="xl">
        <Navbar.Section>
          <Navbar.Brand>
            <A href="/">
              <ImgWithPlaceholder src="/static/gazatu-xyz.nofont.min.svg" alt="gazatu.xyz logo" width={173} height={36} />
            </A>

            <Navbar.Burger expanded={expanded()} onclick={() => setExpanded(v => !v)} aria-label="navigation" />
          </Navbar.Brand>

          <Navbar.Dropdown toggle={<span {...badge(123)}>Trivia</span>} matchHref="/trivia">
            <Menu>
              <Menu.Item badge={<Label color="primary">12</Label>}>
                <A href="/trivia/questions" match {...badge(1)}>Questions</A>
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
              <Switch checked={resolvedColorScheme() === "dark"} onclick={() => setColorScheme((resolvedColorScheme() === "dark") ? "light" : "dark")} />
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
