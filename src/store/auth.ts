import * as keyval from "idb-keyval"
import { createEffect, createMemo, createSignal } from "solid-js"
import { setDefaultFetchInit } from "../lib/fetchFromApi"
import { Auth } from "../lib/schema.gql"

const STORAGE_KEY = "authentication"

const [storedAuth, _setStoredAuth] = createSignal<Auth | null>(null)
const setStoredAuth: (typeof _setStoredAuth) = value => {
  if (typeof value === "function") {
    return _setStoredAuth(prev => {
      keyval.set(STORAGE_KEY, value)
      return value(prev)
    })
  } else {
    keyval.set(STORAGE_KEY, value)
    return _setStoredAuth(value)
  }
}

keyval.get(STORAGE_KEY).then(_setStoredAuth)

const createAuthCheck = (...needed: string[]) => {
  return createMemo(() => {
    const auth = storedAuth()
    if (!auth) {
      return false
    }

    const roles = auth.user?.roles?.map(r => r.name)

    for (const role of needed) {
      if (!roles?.includes(role)) {
        return false
      }
    }

    return true
  })
}

createEffect(() => {
  const auth = storedAuth()

  setDefaultFetchInit(init => ({
    ...init,
    headers: {
      ...init?.headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "authorization": auth ? `Bearer ${auth.token}` : undefined as any,
    },
  }))
})

export {
  storedAuth,
  setStoredAuth,
  createAuthCheck,
}
