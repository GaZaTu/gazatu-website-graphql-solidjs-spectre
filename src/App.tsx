import { MetaProvider, Title } from "@solidjs/meta"
import { Router, useLocation, useNavigate } from "@solidjs/router"
import { Component, ComponentProps, ErrorBoundary } from "solid-js"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import AppMain from "./AppMain"
import iconCheckSquare from "./icons/iconCheckSquare"
import iconMinusSquare from "./icons/iconMinusSquare"
import iconSquare from "./icons/iconSquare"
import FeatherIconProvider from "./lib/FeatherIconProvider"
import { setDefaultFetchInfo } from "./lib/fetchFromApi"
import { setGraphqlEndpoint } from "./lib/fetchGraphQL"
import AnchorContext from "./ui/A.Context"
import CheckboxButton from "./ui/CheckboxButton"
import Icon, { IconContext } from "./ui/Icon"
import ModalPortal from "./ui/Modal.Portal"
import Toaster from "./ui/Toaster"
import { useColorSchemeEffect } from "./ui/util/colorScheme"

IconContext.Provider = FeatherIconProvider
IconContext.iconArrowLeft = FeatherIconProvider.iconArrowLeft
IconContext.iconArrowRight = FeatherIconProvider.iconArrowRight
IconContext.iconArrowUp = FeatherIconProvider.iconArrowUp
IconContext.iconArrowDown = FeatherIconProvider.iconArrowDown
IconContext.iconPhoto = FeatherIconProvider.iconPhoto
IconContext.iconCross = FeatherIconProvider.iconCross
IconContext.iconMenu = FeatherIconProvider.iconMenu
IconContext.iconOpen = FeatherIconProvider.iconOpen
IconContext.iconSearch = FeatherIconProvider.iconSearch

CheckboxButton.Defaults.IfTrue = () => <Icon src={iconCheckSquare} color="var(--success)" />
CheckboxButton.Defaults.IfFalse = () => <Icon src={iconSquare} color="var(--body-fg-monochrome)" />
CheckboxButton.Defaults.IfIndeterminate = () => <Icon src={iconMinusSquare} color="var(--success)" />

AnchorContext.useLocation = useLocation
AnchorContext.useNavigate = useNavigate

if (import.meta.env.MODE === "production") {
  setDefaultFetchInfo("https://api.gazatu.xyz")
  setGraphqlEndpoint("/graphql")
} else {
  setDefaultFetchInfo("https://api.gazatu.xyz")
  setGraphqlEndpoint("/graphql")
}

type Props = {
  url?: string
  head?: ComponentProps<typeof MetaProvider>["tags"]
}

const App: Component<Props> = props => {
  useColorSchemeEffect()

  return (
    <Router url={props.url}>
      <MetaProvider tags={props.head}>
        <Title>gazatu.xyz</Title>
        {/* <Meta name="description">trivia'n'shit</Meta> */}

        <AppHeader />

        <ErrorBoundary fallback={Toaster.pushError}>
          <AppMain />
        </ErrorBoundary>

        <AppFooter />

        <ModalPortal />
        <Toaster />
      </MetaProvider>
    </Router>
  )
}

export default App
