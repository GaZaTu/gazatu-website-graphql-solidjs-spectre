import "modern-normalize/modern-normalize.css"
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

  const { renderToStringAsync, generateHydrationScript } = await import("solid-js/web")
  return {
    root: ROOT_ELEMENT_ID,
    html: await renderToStringAsync(main),
    head: {
      elements: [
        generateHydrationScript(),
      ],
    },
  }
}

export const getRoutesToPrerender: EntryFileExports["getRoutesToPrerender"] = async () => {
  const { default: routes } = await import("./routes")

  return routes
    .map(r => {
      if (r.path === "**") {
        return "__404"
      }

      return String(r.path)
    })
    .filter(i => !i.includes(":") && !i.includes("*"))
}
