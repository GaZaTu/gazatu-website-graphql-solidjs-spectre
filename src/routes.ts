import { RouteDefinition } from "@solidjs/router"
import { lazy } from "solid-js"

const routes: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
  },
  {
    path: "/login",
    component: lazy(() => import("./pages/Login")),
  },
  {
    path: "/profile",
    component: lazy(() => import("./pages/meta/User")),
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
