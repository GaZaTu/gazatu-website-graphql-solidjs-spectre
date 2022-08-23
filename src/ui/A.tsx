import { combineProps } from "@solid-primitives/props"
import { ComponentProps, createEffect, createMemo, splitProps } from "solid-js"
import { createStore } from "solid-js/store"
import AnchorContext, { Location } from "./A.Context"

type Props = ComponentProps<"a"> & {
  delta?: number
  url?: URL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any
  replace?: boolean
  scroll?: boolean
  active?: boolean
  match?: true | { href?: string, exact?: true | "withQuery" }
  external?: boolean
  disabled?: boolean
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
  ])

  const location = AnchorContext.useLocation()
  const navigate = AnchorContext.useNavigate()

  const url = createMemo(() => {
    if (!componentProps.href) {
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

      const asURL = hrefToURL(componentProps.href)
      return asURL
    })()

    if (asURL) {
      for (const [key, value] of Object.entries(componentProps.params ?? {})) {
        asURL.searchParams.append(key, value)
      }
    }

    return {
      asURL,
      asHref: asURL?.toString().replace(DUMMY_ORIGIN, ""),
      isExternal: (componentProps.external || asURL?.origin !== DUMMY_ORIGIN),
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
    const { asURL, asHref, isExternal } = url()

    const onclickDefault = componentProps.onclick

    if (isExternal) {
      return onclickDefault
    }

    if (componentProps.disabled) {
      return e => {
        e.preventDefault()
      }
    }

    if (!navigate) {
      return onclickDefault
    }

    const delta = componentProps.delta
    const state = componentProps.state
    const replace = componentProps.replace
    const scroll = componentProps.scroll

    if (!asHref && !delta) {
      return onclickDefault
    }

    return e => {
      if (typeof onclickDefault === "function") {
        onclickDefault(e)

        if (e.defaultPrevented) {
          return
        }
      }

      e.preventDefault()

      if (delta) {
        navigate(delta)
      } else if (asHref && !locationMatchesURL(location, asURL, { exact: "withQuery" })) {
        navigate(asHref, { state, replace, scroll })
      }
    }
  })

  const [derivedProps, setDerivedProps] = createStore<typeof nativeProps>({})
  createEffect(() => {
    const { asHref, isExternal } = url()

    setDerivedProps(props => ({
      href: asHref,
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined,
      classList: {
        ...props.classList,
        [AnchorContext.activeClass]: active(),
      },
      onclick: onclick(),
    }))
  })

  const combinedProps = combineProps(derivedProps, nativeProps)
  const children = createMemo(() => componentProps.children)

  return [combinedProps, children] as const
}

function A(props: Props) {
  const [_props, _children] = createProps(props)

  return (
    <a {..._props}>
      {_children()}
    </a>
  )
}

export default Object.assign(A, {
  createProps,
  Context: AnchorContext,
})

const DUMMY_ORIGIN = "http://dummy"

const hrefToURL = (href?: string) => {
  if (!href) {
    return undefined
  }

  try {
    return new URL(href)
  } catch {
    if (href[0] === "/") {
      return new URL(`${DUMMY_ORIGIN}${href}`)
    } else {
      return new URL(`${DUMMY_ORIGIN}${location?.pathname}${href}`)
    }
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

  if (typeof match === "object") {
    if (match.exact === true) {
      if (location.pathname !== url.pathname) {
        return false
      }
    } else if (match.exact === "withQuery") {
      if (location.search !== url.search) {
        return false
      }
    }
  }

  return true
}
