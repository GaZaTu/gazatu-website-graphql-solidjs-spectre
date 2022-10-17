import { usePrefersDark } from "@solid-primitives/media"
import { createStorageSignal } from "@solid-primitives/storage"
import { createMemo, createRenderEffect } from "solid-js"

export type ColorScheme = "light" | "dark" | null

const prefersDark = usePrefersDark(true)

const [colorScheme, setColorScheme] = createStorageSignal<ColorScheme>("color-scheme", null, {
  api: (() => {
    if (typeof window === "undefined") {
      return undefined
    }

    return window.localStorage
  })(),
})

const computedColorScheme = createMemo(() => {
  let scheme = colorScheme()
  if (scheme) {
    return scheme
  }

  scheme = prefersDark() ? "dark" : "light"
  return scheme
})

const useColorSchemeEffect = () => {
  createRenderEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const scheme = computedColorScheme()
    window.document.documentElement.className = scheme
  })
}

export {
  colorScheme,
  setColorScheme,
  computedColorScheme,
  useColorSchemeEffect,
}
