import { MetaProvider, Title } from "@solidjs/meta"
import { Router, useLocation, useNavigate } from "@solidjs/router"
import { Component, ComponentProps, ErrorBoundary } from "solid-js"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import AppMain from "./AppMain"
import { setDefaultFetchInfo } from "./lib/fetchFromApi"
import { setGraphqlEndpoint } from "./lib/fetchGraphQL"
import AnchorContext from "./ui/A.Context"
import Toaster from "./ui/Toaster"
import { useColorSchemeEffect } from "./ui/util/colorScheme"

AnchorContext.useLocation = useLocation
AnchorContext.useNavigate = useNavigate

setDefaultFetchInfo("https://api.gazatu.xyz")
setGraphqlEndpoint("https://api.gazatu.xyz/graphql")

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

        <AppHeader />

        <ErrorBoundary fallback={Toaster.pushError}>
          <AppMain />
        </ErrorBoundary>

        <AppFooter />

        <Toaster />
      </MetaProvider>
    </Router>
  )
}

export default App
