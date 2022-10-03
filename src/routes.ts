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
    path: "/logout",
    component: lazy(() => import("./pages/Logout")),
  },
  {
    path: "/users",
    component: lazy(() => import("./pages/meta/UserList")),
  },
  {
    path: "/users/:id",
    component: lazy(() => import("./pages/meta/User")),
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
    path: "/trivia/questions",
    component: lazy(() => import("./pages/trivia/TriviaQuestionList")),
  },
  {
    path: "/trivia/questions/:id",
    component: lazy(() => import("./pages/trivia/TriviaQuestion")),
  },
  {
    path: "/trivia/reports",
    component: lazy(() => import("./pages/trivia/TriviaReportList")),
  },
  {
    path: "/blog/gallery",
    component: lazy(() => import("./pages/blog/BlogGallery")),
  },
  {
    path: "/trading/chart",
    component: lazy(() => import("./pages/trading/Chart")),
  },
  {
    path: "**",
    component: lazy(() => import("./pages/Http404")),
  },
]

export default routes
