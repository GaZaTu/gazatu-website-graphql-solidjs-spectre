import { combineProps } from "@solid-primitives/props"
import classnames from "classnames"
import { ComponentProps, createMemo, createRenderEffect, splitProps } from "solid-js"
import { createStore } from "solid-js/store"
import AnchorContext, { Location } from "./A.Context"

const scrollHistory = {
  data: new Map<string | number, number>(), // TODO: use sessionStorage instead
  store: (key: string | number | "byIndex" | "byPath" | "byHref" = "byIndex", { top }: { top?: number } = {}) => {
    switch (key) {
    case "byPath":
      key = window.location.pathname
      break
    case "byHref":
      key = window.location.href
      break
    }

    if (top === undefined) {
      top = window.scrollY
    }

    if (key === "byIndex") {
      window.history.replaceState({ top }, "")
    } else {
      scrollHistory.data.set(key, top)
    }
  },
  restore: (key: string | number | "byIndex" | "byPath" | "byHref" = "byIndex", { behavior }: { behavior?: ScrollBehavior } = {}) => {
    switch (key) {
    case "byPath":
      key = window.location.pathname
      break
    case "byHref":
      key = window.location.href
      break
    }

    let top = undefined as number | undefined

    if (key === "byIndex") {
      void ({ top } = window.history.state ?? {})
      window.history.replaceState({ top: undefined }, "")
    } else {
      top = scrollHistory.data.get(key)
      scrollHistory.data.delete(key)
    }

    if (top === undefined) {
      return
    }

    window.scrollTo({ top, behavior })
  },
}

type Props = ComponentProps<"a"> & {
  delta?: number
  url?: URL
  params?: Record<string, any>
  state?: any
  replace?: boolean
  scroll?: boolean
  active?: boolean
  match?: "prefix" | "path" | "href"
  matchHref?: string
  external?: boolean
  disabled?: boolean
  keepExistingParams?: boolean
  storeScroll?: boolean | string | number | "byIndex" | "byPath" | "byHref"
}

const createProps = (_props: Props) => {
  const [componentProps, nativeProps] = splitProps(_props, [
    "children",
    "href",
    "onclick",
    "delta",
    "url",
    "params",
    "state",
    "replace",
    "scroll",
    "active",
    "match",
    "matchHref",
    "external",
    "disabled",
    "keepExistingParams",
    "storeScroll",
  ])

  const location = AnchorContext.useLocation()
  const navigate = AnchorContext.useNavigate()

  const url = createMemo(() => {
    const {
      href,
      url,
      keepExistingParams,
      params,
      external,
    } = componentProps

    if (href === undefined) {
      return {
        asURL: undefined,
        asHref: undefined,
        isExternal: false,
      }
    }

    const asURL = (() => {
      if (url) {
        return url
      }

      if (!href) {
        return hrefToURL(location?.pathname)
      }

      const asURL = hrefToURL(href)
      return asURL
    })()

    if (asURL) {
      if (keepExistingParams) {
        for (const [key, value] of Object.entries(location?.query ?? {})) {
          asURL.searchParams.append(key, value)
        }
      }

      for (const [key, value] of Object.entries(params ?? {})) {
        asURL.searchParams.delete(key)
        asURL.searchParams.append(key, value)
      }
    }

    return {
      asURL,
      asHref: asURL?.toString().replace(RELATIVE_ORIGIN, ""),
      isExternal: (external || asURL?.origin !== RELATIVE_ORIGIN),
    }
  })

  const active = createMemo(() => {
    const { asURL } = url()
    const {
      active,
      match,
      matchHref,
    } = componentProps

    if (active) {
      return true
    }

    const result = locationMatchesURL(location, asURL ?? hrefToURL(matchHref), match)
    return result
  })

  const onclick = createMemo<Props["onclick"]>(() => {
    return e => {
      const { asURL, asHref, isExternal } = url()
      const {
        onclick,
        disabled,
        delta,
        state,
        replace,
        scroll,
        storeScroll,
      } = componentProps

      if (disabled) {
        e.preventDefault()
        return
      }

      if (typeof onclick === "function") {
        onclick(e)

        if (e.defaultPrevented) {
          return
        }

        if (isExternal) {
          return
        }
      }

      e.preventDefault()

      if (navigate && (asHref || delta)) {
        if (delta) {
          navigate(delta)
        } else if (asHref && !locationMatchesURL(location, asURL, "href")) {
          if (storeScroll !== undefined) {
            if (typeof storeScroll === "boolean") {
              if (storeScroll) {
                scrollHistory.store()
              }
            } else {
              scrollHistory.store(storeScroll)
            }
          }

          navigate(asHref, { state, replace, scroll })
        }
      }
    }
  })

  const [derivedProps, setDerivedProps] = createStore<typeof nativeProps>({})
  createRenderEffect(() => {
    const { asHref, isExternal } = url()

    const _active = active()
    const _onclick = onclick()

    setDerivedProps(props => ({
      href: asHref ?? "#",
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined,
      class: classnames({
        [AnchorContext.activeClass]: _active,
      }),
      onclick: _onclick,
    }))
  })

  const combinedProps = combineProps(derivedProps, nativeProps)
  const children = createMemo(() => componentProps.children)

  return [combinedProps, children] as const
}

function A(props: Props) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <a {..._props}>
      {fml.children ?? props.href}
    </a>
  )
}

export default Object.assign(A, {
  createProps,
  scrollHistory,
  Context: AnchorContext,
})

const RELATIVE_ORIGIN = "http://__relative__"

const hrefToURL = (href?: string) => {
  if (!href) {
    return undefined
  }

  try {
    return new URL(href)
  } catch {
    if (href[0] !== "/") {
      href = `${location?.pathname}${href}`
    }

    return new URL(`${RELATIVE_ORIGIN}${href}`)
  }
}

const locationMatchesURL = (location?: Location, url?: URL, match?: Props["match"]) => {
  if (!location || !url || !match) {
    return false
  }

  switch (match) {
  case "prefix":
    return location.pathname.startsWith(url.pathname)

  case "path":
    return location.pathname === url.pathname

  case "href":
    return (
      location.pathname === url.pathname &&
      location.search === url.search
    )

  default:
    return false
  }
}
