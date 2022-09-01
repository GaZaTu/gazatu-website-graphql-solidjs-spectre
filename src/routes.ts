import { RouteDefinition } from "@solidjs/router"
import { lazy } from "solid-js"

type RouteDefinitionExt = RouteDefinition & {
  moduleId?: string
}

const routes: RouteDefinitionExt[] = [
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
  },
  {
    path: "/trivia/categories",
    component: lazy(() => import("./pages/trivia/TriviaCategoryList")),
  },
  {
    path: "**",
    component: lazy(() => import("./pages/Http404")),
  },
]

export default routes
