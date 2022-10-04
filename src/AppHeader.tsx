import debounce from "debounce"
import { Component, createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js"
import { defaultFetchInfo } from "./lib/fetchFromApi"
import fetchGraphQL, { gql } from "./lib/fetchGraphQL"
import { Query, TriviaCounts } from "./lib/schema.gql"
import { createAuthCheck, storedAuth } from "./store/auth"
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
import Toaster from "./ui/Toaster"
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

            <Navbar.Burger expanded={expanded()} onclick={() => setExpanded(v => !v)} aria-label="navigation" />
          </Navbar.Brand>

          <Navbar.Dropdown toggle={<span {...badge(triviaTodos())}>Trivia</span>} matchHref="/trivia">
            <Menu style={{ "min-width": "12rem" }}>
              <Menu.Item>
                <A href="/trivia/questions/new" match={{ exact: true }}>Submit Question</A>
              </Menu.Item>
              <Menu.Item>
                <A href="/trivia/categories/new" match={{ exact: true }}>Submit Category</A>
              </Menu.Item>
              <Menu.Item>
                <A href="/trivia/reports/new" match={{ exact: true }}>Report Question</A>
              </Menu.Item>
              <Divider />
              <Menu.Item badge={createTriviaCountsMenuLabel("questions")}>
                <A href="/trivia/questions" match={{ exact: "withQuery" }}>Questions</A>
              </Menu.Item>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("questionsNotVerified")}>
                  <A href="/trivia/questions" params={{ verified: false }} match={{ exact: "withQuery" }}>Questions (not verified)</A>
                </Menu.Item>
              </Show>
              <Menu.Item badge={createTriviaCountsMenuLabel("categories")}>
                <A href="/trivia/categories" match={{ exact: "withQuery" }}>Categories</A>
              </Menu.Item>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("categoriesNotVerified")}>
                  <A href="/trivia/categories" params={{ verified: false }} match={{ exact: "withQuery" }}>Categories (not verified)</A>
                </Menu.Item>
              </Show>
              <Show when={isTriviaAdmin()}>
                <Menu.Item badge={createTriviaCountsMenuLabel("reports")}>
                  <A href="/trivia/reports" match={{ exact: "withQuery" }}>Reports</A>
                </Menu.Item>
              </Show>
            </Menu>
          </Navbar.Dropdown>

          <Button.A href="/blog/gallery" match>Blog</Button.A>
          <Show when={isLoggedIn()}>
            <Button.A href="/trading/chart" match>TChart</Button.A>
          </Show>
          <Show when={isAdmin()}>
            <Button.A href="/users" match>Users</Button.A>
          </Show>
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
                        <span>Dark Theme</span>
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
                <Button.A href="/login" color="primary" round>Login</Button.A>
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

export default AppHeader
