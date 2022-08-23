import { Router, useLocation, useNavigate } from "@solidjs/router"
import { Component } from "solid-js"
import AppMain from "./AppMain"
import AppNav from "./AppNav"
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
      <AppNav />
      <AppMain />
    </Router>
  )
}

export default App
