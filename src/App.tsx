import { Router } from "@solidjs/router"
import { Component } from "solid-js"

import AppMain from "./AppMain"
import AppNav from "./AppNav"
import { useColorSchemeEffect } from "./ui/util/colorScheme"

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
