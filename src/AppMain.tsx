import { useRoutes } from "@solidjs/router"
import { Component, Suspense } from "solid-js"
import routes from "./routes"

const AppMain: Component = () => {
  const Route = useRoutes(routes)

  return (
    <main id="AppMain">
      <Suspense>
        <Route />
      </Suspense>
    </main>
  )
}

export default AppMain
