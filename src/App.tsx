import { Router, useLocation, useNavigate } from "@solidjs/router"
import { Component } from "solid-js"
import AppFooter from "./AppFooter"
import AppHeader from "./AppHeader"
import AppMain from "./AppMain"
import A from "./ui/A"
import { useColorSchemeEffect } from "./ui/util/colorScheme"

A.Context.useLocation = useLocation
A.Context.useNavigate = useNavigate

type Props = {
  url?: string
}

const App: Component<Props> = props => {
  useColorSchemeEffect()

  return (
    <Router url={props.url}>
      <AppHeader />
      <AppMain />
      <AppFooter />
    </Router>
  )
}

export default App
