import { createSignal } from "solid-js"

const [defaultFetchInfo, setDefaultFetchInfo] = createSignal<string>()
const [defaultFetchInit, setDefaultFetchInit] = createSignal<RequestInit>()

export {
  defaultFetchInfo,
  setDefaultFetchInfo,
  defaultFetchInit,
  setDefaultFetchInit,
}
export {
  fetch,
}

const mergeFetchParams = (...[info, init]: Parameters<typeof window.fetch>) => {
  const defaultInfo = defaultFetchInfo()
  const defaultInit = defaultFetchInit()

  if (info instanceof URL) {
    info = String(info)
  }

  if (typeof info === "string") {
    if (defaultInfo && !info.startsWith("http")) {
      info = `${defaultInfo}${info}`
    }
  }

  init = {
    ...defaultInit,
    ...init,
    headers: {
      ...defaultInit?.headers,
      ...init?.headers,
    },
  }

  return [info, init] as const
}

const fetch: (typeof window.fetch) = (info, init) => {
  return window.fetch(...mergeFetchParams(info, init))
}
