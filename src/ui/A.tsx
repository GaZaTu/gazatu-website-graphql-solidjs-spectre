import { combineProps } from "@solid-primitives/props"
import classnames from "classnames"
import { ComponentProps, createMemo, createRenderEffect, splitProps } from "solid-js"
import { createStore } from "solid-js/store"
import AnchorContext, { Location } from "./A.Context"

type Props = ComponentProps<"a"> & {
  delta?: number
  url?: URL
  params?: Record<string, any>
  state?: any
  replace?: boolean
  scroll?: boolean
  active?: boolean
  match?: true | { href?: string, exact?: true | "withQuery" }
  external?: boolean
  disabled?: boolean
  keepExistingParams?: boolean
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
    "external",
    "disabled",
    "keepExistingParams",
  ])

  const location = AnchorContext.useLocation()
  const navigate = AnchorContext.useNavigate()

  const url = createMemo(() => {
    if (componentProps.href === undefined) {
      return {
        asURL: undefined,
        asHref: undefined,
        isExternal: false,
      }
    }

    const asURL = (() => {
      if (componentProps.url) {
        return componentProps.url
      }

      if (!componentProps.href) {
        return hrefToURL(location?.pathname)
      }

      const asURL = hrefToURL(componentProps.href)
      return asURL
    })()

    if (asURL) {
      if (componentProps.keepExistingParams) {
        for (const [key, value] of Object.entries(location?.query ?? {})) {
          asURL.searchParams.append(key, value)
        }
      }

      for (const [key, value] of Object.entries(componentProps.params ?? {})) {
        asURL.searchParams.delete(key)
        asURL.searchParams.append(key, value)
      }
    }

    return {
      asURL,
      asHref: asURL?.toString().replace(RELATIVE_ORIGIN, ""),
      isExternal: (componentProps.external || asURL?.origin !== RELATIVE_ORIGIN),
    }
  })

  const active = createMemo(() => {
    const { asURL } = url()

    if (componentProps.active) {
      return true
    }

    const active = locationMatchesURL(location, asURL, componentProps.match)
    return active
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
      } = componentProps

      if (disabled) {
        e.preventDefault()
        return
      }

      if (typeof onclick === "function") {
        if (isExternal) {
          onclick(e)
          return
        }

        onclick(e)

        if (e.defaultPrevented) {
          return
        }
      }

      e.preventDefault()

      if (navigate && (asHref || delta)) {
        if (delta) {
          navigate(delta)
        } else if (asHref && !locationMatchesURL(location, asURL, { exact: "withQuery" })) {
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
  if (!url && typeof match === "object" && match.href) {
    url = hrefToURL(match.href)
  }

  if (!location || !url || !match) {
    return false
  }

  if (!location.pathname.startsWith(url.pathname)) {
    return false
  }

  if (typeof match === "object" && match.exact) {
    if (location.pathname !== url.pathname) {
      return false
    }

    if (match.exact === "withQuery") {
      if (location.search !== url.search) {
        return false
      }
    }
  }

  return true
}
