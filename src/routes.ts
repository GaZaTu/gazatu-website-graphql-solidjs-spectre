import { RouteDefinition } from "@solidjs/router"
import { lazy } from "solid-js"

type RouteDefinitionExt = RouteDefinition & {
  moduleId?: string
}

const routes: RouteDefinitionExt[] = [
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
    moduleId: "src/pages/Home.tsx",
  },
  {
    path: "**",
    component: lazy(() => import("./pages/Http404")),
    moduleId: "src/pages/Http404.tsx",
  },
]

export default routes
