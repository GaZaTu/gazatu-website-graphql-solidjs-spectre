import { usePrefersDark } from "@solid-primitives/media"
import { createStorageSignal } from "@solid-primitives/storage"
import { createEffect, createMemo } from "solid-js"

export type ColorScheme = "light" | "dark"

const prefersDark = usePrefersDark(true)

const [storedColorScheme, setColorScheme] = createStorageSignal<ColorScheme>("color-scheme", undefined, {
  api: (() => {
    if (typeof window === "undefined") {
      return undefined
    }

    return window.localStorage
  })(),
})

const colorScheme = createMemo(() => {
  let scheme = storedColorScheme()
  if (scheme) {
    return scheme
  }

  scheme = prefersDark() ? "dark" : "light"
  return scheme
})

const useColorSchemeEffect = () => {
  createEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const scheme = colorScheme()
    window.document.documentElement.className = scheme
  })
}

export {
  colorScheme,
  setColorScheme,
  useColorSchemeEffect,
}
