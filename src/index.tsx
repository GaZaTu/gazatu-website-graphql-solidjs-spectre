import "modern-normalize/modern-normalize.css"
import { __ssrLoadedModules } from "vite-ssg-but-for-everyone"
import type { EntryFileExports } from "vite-ssg-but-for-everyone/node"
import App from "./App"
import "./index.scss"

const ROOT_ELEMENT_ID = "root"

if (typeof window !== "undefined") {
  const main = () => <App />
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = document.getElementById(ROOT_ELEMENT_ID)!

  if (import.meta.env.VITE_SSG) {
    const { hydrate } = await import("solid-js/web")
    hydrate(main, root)
  } else {
    const { render } = await import("solid-js/web")
    render(main, root)
  }
}

export const prerender: EntryFileExports["prerender"] = async context => {
  const main = () => <App url={context.route} />

  const { renderToStringAsync, getHydrationScript } = await import("solid-js/web")
  return {
    html: await renderToStringAsync(main),
    head: {
      elements: [
        getHydrationScript(),
      ],
    },
    preload: __ssrLoadedModules.slice(),
  }
}

export const setupPrerender: EntryFileExports["setupPrerender"] = async () => {
  const { default: routes } = await import("./routes")

  return {
    root: ROOT_ELEMENT_ID,
    routes: routes
      .map(r => {
        if (r.path === "**") {
          return "__404"
        }

        return String(r.path)
      })
      .filter(i => !i.includes(":") && !i.includes("*")),
    csp: {
      fileName: "csp.conf",
      fileType: "nginx-conf",
      template: "script-src 'self' {{INLINE_SCRIPT_HASHES}}; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; trusted-types *;",
    },
  }
}
