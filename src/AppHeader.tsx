import { iconGithub } from "@gazatu/solid-spectre/icons/iconGithub"
import { iconLogIn } from "@gazatu/solid-spectre/icons/iconLogIn"
import { iconMoon } from "@gazatu/solid-spectre/icons/iconMoon"
import { iconSun } from "@gazatu/solid-spectre/icons/iconSun"
import { A } from "@gazatu/solid-spectre/ui/A"
import { Avatar } from "@gazatu/solid-spectre/ui/Avatar"
import { Button } from "@gazatu/solid-spectre/ui/Button"
import { CheckboxButton } from "@gazatu/solid-spectre/ui/CheckboxButton"
import { Column } from "@gazatu/solid-spectre/ui/Column"
import { Divider } from "@gazatu/solid-spectre/ui/Divider"
import { Icon } from "@gazatu/solid-spectre/ui/Icon"
import { ImgWithPlaceholder } from "@gazatu/solid-spectre/ui/ImgWithPlaceholder"
import { Label } from "@gazatu/solid-spectre/ui/Label"
import { Menu } from "@gazatu/solid-spectre/ui/Menu"
import { Navbar } from "@gazatu/solid-spectre/ui/Navbar"
import { GlobalProgress } from "@gazatu/solid-spectre/ui/Progress.Global"
import { Section } from "@gazatu/solid-spectre/ui/Section"
import { Toaster } from "@gazatu/solid-spectre/ui/Toaster"
import { badge } from "@gazatu/solid-spectre/util/badge"
import { computedColorScheme, setColorScheme } from "@gazatu/solid-spectre/util/colorScheme"
import { centerChildren } from "@gazatu/solid-spectre/util/position"
import { tooltip } from "@gazatu/solid-spectre/util/tooltip"
import debounce from "debounce"
import { Component, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { defaultFetchInfo } from "./lib/fetchFromApi"
import fetchGraphQL, { gql } from "./lib/fetchGraphQL"
import { Query, TriviaCounts } from "./lib/schema.gql"
import { createAuthCheck, storedAuth } from "./store/auth"

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
  setShowAppHeader,
  showAppHeader,
  useShowAppHeaderEffect,
}

const AppHeader: Component = () => {
  const isLoggedIn = createAuthCheck()
  const isAdmin = createAuthCheck("admin")
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const [triviaCounts, setTriviaCounts] = createSignal<TriviaCounts>()

  createEffect(async () => {
    const triviaAdmin = isTriviaAdmin()
    if (!triviaAdmin) {
      setTriviaCounts(undefined)
      return
    }

    const updateTriviaCounts = debounce(async () => {
      try {
        const result = await fetchGraphQL<Query>({
          query: gql`
            query {
              triviaCounts {
                questions
                questionsNotVerified
                categories
                categoriesNotVerified
                reports
              }
            }
          `,
        })

        setTriviaCounts(result.triviaCounts)
      } catch (error) {
        Toaster.pushError(error)
      }
    }, 1000)

    await updateTriviaCounts()

    try {
      const result = await fetchGraphQL<Query>({
        query: gql`
          query {
            triviaEventsOTP
          }
        `,
      })

      const events = new EventSource(`${defaultFetchInfo()}/trivia/events?otp=${result.triviaEventsOTP}`)
      events.onmessage = ev => updateTriviaCounts()
    } catch (error) {
      Toaster.pushError(error)
    }
  })

  const triviaTodos = createMemo(() => {
    const counts = triviaCounts()
    if (!counts) {
      return undefined
    }

    return counts.questionsNotVerified! + counts.categoriesNotVerified! + counts.reports!
  })

  const createTriviaCountsMenuLabel = (key: keyof TriviaCounts) => {
    return (
      <Show when={triviaCounts()} keyed>
        {counts => (
          <Label color="primary">{counts[key]}</Label>
        )}
      </Show>
    )
  }

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

            <Navbar.Burger expanded={expanded()} onclick={() => setExpanded(v => !v)} aria-label="toggle navigation" />
          </Navbar.Brand>

          <Navbar.Dropdown toggle={toggle => (
            <span {...badge(triviaTodos())} {...toggle}>Trivia</span>
          )} matchHref="/trivia">
            <Menu style={{ "min-width": "12rem" }}>
              <Menu.Item>
                <A href="/trivia/questions/new" match="path">Submit Question</A>
              </Menu.Item>
              <Menu.Item>
                <A href="/trivia/categories/new" match="path">Submit Category</A>
              </Menu.Item>
              <Divider />
              <Menu.Item badge={createTriviaCountsMenuLabel("questions")}>
                <A href="/trivia/questions" match="href">Questions</A>
              </Menu.Item>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("questionsNotVerified")}>
                  <A href="/trivia/questions" params={{ verified: false }} match="href">Questions (not verified)</A>
                </Menu.Item>
              </Show>
              <Menu.Item badge={createTriviaCountsMenuLabel("categories")}>
                <A href="/trivia/categories" match="href">Categories</A>
              </Menu.Item>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("categoriesNotVerified")}>
                  <A href="/trivia/categories" params={{ verified: false }} match="href">Categories (not verified)</A>
                </Menu.Item>
              </Show>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("reports")}>
                  <A href="/trivia/reports" match="href">Reports</A>
                </Menu.Item>
              </Show>
            </Menu>
          </Navbar.Dropdown>

          <Button.A href="/blog/gallery" match="prefix">Blog</Button.A>
          <Show when={isLoggedIn()}>
            <Button.A href="/trading/chart" match="path">TChart</Button.A>
          </Show>
          <Show when={isAdmin()}>
            <Button.A href="/users" match="path">Users</Button.A>
          </Show>
        </Navbar.Section>

        <Navbar.Section>
          <Column.Row gaps="sm">
            <Column class={`${centerChildren(true)}`}>
              <Button.A href="http://github.com/GaZaTu/gazatu-website-graphql-solidjs-spectre" color="gray" action {...tooltip("open github", "bottom")}>
                <Icon src={iconGithub} />
              </Button.A>
            </Column>

            <Column class={`${centerChildren(true)}`}>
              <CheckboxButton checked={computedColorScheme() === "dark"} onclick={() => setColorScheme((computedColorScheme() === "dark") ? "light" : "dark")} {...tooltip("toggle color scheme", "bottom")} color="gray" action circle={false}
                ifTrue={<Icon src={iconSun} />}
                ifFalse={<Icon src={iconMoon} />}
              />
            </Column>

            <Column class={`${centerChildren(true)}`}>
              <Show when={storedAuth()} fallback={
                <Button.A href="/login" color="primary" action {...tooltip("login", "bottom")}>
                  <Icon src={iconLogIn} />
                </Button.A>
              }>
                <A href="/profile">
                  <Avatar size="btn" initials={storedAuth()?.user?.username?.slice(0, 2)} {...tooltip("user profile", "bottom")} />
                </A>
              </Show>
            </Column>
          </Column.Row>
        </Navbar.Section>
      </Section>
    </Navbar>
  )
}

export default AppHeader
