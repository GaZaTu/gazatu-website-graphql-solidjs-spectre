import { MetaProvider, Title } from "@solidjs/meta"
import { Router, useLocation, useNavigate } from "@solidjs/router"
import { Component, ComponentProps, ErrorBoundary } from "solid-js"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import AppMain from "./AppMain"
import { setDefaultFetchInfo } from "./lib/fetchFromApi"
import { setGraphqlEndpoint } from "./lib/fetchGraphQL"
import AnchorContext from "./ui/A.Context"
import ModalPortal from "./ui/Modal.Portal"
import Toaster from "./ui/Toaster"
import { useColorSchemeEffect } from "./ui/util/colorScheme"

AnchorContext.useLocation = useLocation
AnchorContext.useNavigate = useNavigate

if (import.meta.env.MODE === "production") {
  setDefaultFetchInfo("https://api.gazatu.xyz")
  setGraphqlEndpoint("/graphql")
} else {
  setDefaultFetchInfo("http://127.0.0.1:3434")
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
