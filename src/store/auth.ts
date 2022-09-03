import { createStorageSignal } from "@solid-primitives/storage"
import { createEffect, createMemo } from "solid-js"
import { setDefaultFetchInit } from "../lib/fetchFromApi"
import { AuthResult } from "../lib/schema.gql"

const [storedAuth, setStoredAuth] = createStorageSignal<AuthResult | null>("auth-data", null, {
  api: (() => {
    if (typeof window === "undefined") {
      return undefined
    }

    return window.localStorage
  })(),
  serializer: (v: unknown) => JSON.stringify(v),
  deserializer: (s: string) => JSON.parse(s),
})

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
