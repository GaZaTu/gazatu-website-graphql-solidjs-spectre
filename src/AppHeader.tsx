import { Component, createEffect, createSignal, onCleanup, Show } from "solid-js"
import { storedAuth } from "./store/auth"
import A from "./ui/A"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import Column from "./ui/Column"
import Divider from "./ui/Divider"
import Icon from "./ui/Icon"
import iconPerson from "./ui/icons/iconPerson"
import ImgWithPlaceholder from "./ui/ImgWithPlaceholder"
import Label from "./ui/Label"
import Menu from "./ui/Menu"
import Navbar from "./ui/Navbar"
import GlobalProgress from "./ui/Progress.Global"
import Section from "./ui/Section"
import Switch from "./ui/Switch"
import { badge } from "./ui/util/badge"
import { computedColorScheme, setColorScheme } from "./ui/util/colorScheme"
import { centerSelf } from "./ui/util/position"

const [showAppHeader, setShowAppHeader] = createSignal(true)
const useShowAppHeaderEffect = (show: boolean) => {
  createEffect(() => {
    setShowAppHeader(show)
  })

  onCleanup(() => {
    setShowAppHeader(true)
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
              <Menu.Item>
                <A href="/trivia/questions/new" match>Submit Question</A>
              </Menu.Item>
              <Menu.Item>
                <A href="/trivia/categories/new" match>Submit Category</A>
              </Menu.Item>
              <Divider />
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
              <Switch checked={computedColorScheme() === "dark"} onclick={() => setColorScheme((computedColorScheme() === "dark") ? "light" : "dark")} />
            </Column>

            <Column>
              <A href={storedAuth() ? "/profile" : "/login"} aria-label={storedAuth() ? "profile" : "login"}>
                <Avatar initials={storedAuth()?.user?.username?.slice(0, 2)}>
                  <Show when={!storedAuth()}>
                    <Icon src={iconPerson} classList={{ ...centerSelf(true) }} style={{ top: "25%" }} />
                  </Show>
                </Avatar>
              </A>
            </Column>
          </Column.Row>
        </Navbar.Section>
      </Section>
    </Navbar>
  )
}

export default AppNav
