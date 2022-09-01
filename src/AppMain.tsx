import { useIsRouting, useRoutes } from "@solidjs/router"
import { Component, Suspense } from "solid-js"
import routes from "./routes"
import { createGlobalProgressStateEffect } from "./ui/Progress.Global"

const AppMain: Component = () => {
  const Route = useRoutes(routes)

  // only works with <Suspense>
  const routing = useIsRouting()
  createGlobalProgressStateEffect(routing)

  return (
    <main id="AppMain">
      <noscript>You need to enable JavaScript to use this app!</noscript>

      <Suspense>
        <Route />
      </Suspense>
    </main>
  )
}

export default AppMain
