const getThemeValue = (variableName: string, defaultValue?: string) => {
  if (typeof window === "undefined") {
    return defaultValue
  }

  const value = window.getComputedStyle(window.document.documentElement)
    .getPropertyValue(variableName)

  return value
}

export default getThemeValue
