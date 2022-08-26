import { useIsRouting, useRoutes } from "@solidjs/router"
import { Component, createEffect, Suspense } from "solid-js"
import routes from "./routes"
import { setGlobalProgressState } from "./ui/Progress.Global"

const AppMain: Component = () => {
  const Route = useRoutes(routes)

  const routing = useIsRouting()
  createEffect(() => {
    const _routing = routing()

    setGlobalProgressState(state => ({
      ...state,
      visible: _routing,
    }))
  })

  return (
    <main id="AppMain">
      <Suspense>
        <Route />
      </Suspense>
    </main>
  )
}

export default AppMain
