import { Component, createEffect, createSignal, onCleanup, Show } from "solid-js"
import { storedAuth } from "./store/auth"
import A from "./ui/A"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import Column from "./ui/Column"
import Divider from "./ui/Divider"
import Dropdown from "./ui/Dropdown"
import FormGroup from "./ui/Form.Group"
import Icon from "./ui/Icon"
import iconMoreVert from "./ui/icons/iconMoreVert"
import ImgWithPlaceholder from "./ui/ImgWithPlaceholder"
import Label from "./ui/Label"
import Menu from "./ui/Menu"
import Navbar from "./ui/Navbar"
import GlobalProgress from "./ui/Progress.Global"
import Section from "./ui/Section"
import Switch from "./ui/Switch"
import { badge } from "./ui/util/badge"
import { computedColorScheme, setColorScheme } from "./ui/util/colorScheme"
import { centerChildren } from "./ui/util/position"

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
    <Navbar id="AppHeader" size="lg" filled style={{ display: !showAppHeader() ? "none" : "flex" }} responsive expanded={expanded()}>
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
          <Column.Row gaps="sm">
            <Column classList={{ ...centerChildren(true) }}>
              <Button.A href="http://github.com/GaZaTu/gazatu-website-graphql-solidjs-spectre" color="link" action>
                <ImgWithPlaceholder src={(computedColorScheme() === "dark") ? "/static/github-octocat.dark.min.svg" : "/static/github-octocat.min.svg"} alt="github" width={26} height={26} />
              </Button.A>
            </Column>

            <Column classList={{ ...centerChildren(true) }}>
              <Dropdown right toggle={(
                <Button.A action>
                  <Icon src={iconMoreVert} />
                </Button.A>
              )}>
                <Menu>
                  <Menu.Item>
                    <FormGroup>
                      <Switch checked={computedColorScheme() === "dark"} onclick={() => setColorScheme((computedColorScheme() === "dark") ? "light" : "dark")}>
                        Dark Theme
                      </Switch>
                    </FormGroup>
                  </Menu.Item>
                  <Show when={storedAuth()}>
                    <Divider />
                    <Menu.Item>
                      <A href="/profile" match>Profile</A>
                    </Menu.Item>
                    <Menu.Item>
                      <A href="/logout">Logout</A>
                    </Menu.Item>
                  </Show>
                </Menu>
              </Dropdown>
            </Column>

            <Column classList={{ ...centerChildren(true) }}>
              <Show when={storedAuth()} fallback={
                <Button.A href="/login" color="gray">Login</Button.A>
              }>
                <A href="/profile">
                  <Avatar initials={storedAuth()?.user?.username?.slice(0, 2)} />
                </A>
              </Show>
            </Column>
          </Column.Row>
        </Navbar.Section>
      </Section>
    </Navbar>
  )
}

export default AppNav
