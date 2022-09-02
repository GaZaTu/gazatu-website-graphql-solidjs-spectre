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
    path: "/trivia/categories/:id",
    component: lazy(() => import("./pages/trivia/TriviaCategory")),
  },
  {
    path: "**",
    component: lazy(() => import("./pages/Http404")),
  },
]

export default routes
