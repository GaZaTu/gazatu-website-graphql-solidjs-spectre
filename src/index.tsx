import { renderTags } from "@solidjs/meta"
import "modern-normalize/modern-normalize.css"
import { ComponentProps } from "solid-js"
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
  const head = [] as ComponentProps<typeof App>["head"]
  const main = () => <App url={context.route} head={head} />

  const { renderToStringAsync, generateHydrationScript } = await import("solid-js/web")
  return {
    html: await renderToStringAsync(main),
    head: {
      elements: [
        generateHydrationScript(),
        renderTags(head ?? []),
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
        const path = String(r.path)

        if (path === "**") {
          return "__404"
        }

        if (path.endsWith(":id")) {
          return path.replace(":id", "__id")
        }

        return path
      })
      .filter(i => !i.includes(":") && !i.includes("*")),
    csp: {
      fileName: "csp.conf",
      fileType: "nginx-conf",
      template: "script-src 'self' {{INLINE_SCRIPT_HASHES}}; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; trusted-types *;",
    },
    dyn: {
      fileName: "dyn.conf",
      fileType: "nginx-conf",
      routes: [
        {
          matches: "^(.*)/__id$",
          template: `
            location ~ ^{{$1}}/[^/]+ {
              limit_req zone=mylimit burst=20 nodelay;
              try_files $uri {{$0}}/index.html =404;
            }
          `,
        },
      ],
    },
  }
}
