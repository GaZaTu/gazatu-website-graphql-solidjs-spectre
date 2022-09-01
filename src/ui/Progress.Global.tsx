import { Accessor, createEffect, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { isServer } from "solid-js/web"
import Progress from "./Progress"

const globalProgressStateDefaults = {
  visible: isServer as boolean,
  value: undefined as number | undefined,
  max: undefined as number | undefined,
}

const [globalProgressState, setGlobalProgressState] = createStore({ ...globalProgressStateDefaults })
const createGlobalProgressStateEffect = (getVisible: Accessor<boolean>) => {
  createEffect(() => {
    const visible = getVisible()

    setGlobalProgressState(state => ({
      ...state,
      visible,
    }))
  })

  onCleanup(() => {
    setGlobalProgressState({ ...globalProgressStateDefaults })
  })
}

export {
  globalProgressState,
  setGlobalProgressState,
  createGlobalProgressStateEffect,
}

function GlobalProgress() {
  return (
    <Progress fixedTop value={globalProgressState.value} max={globalProgressState.max} style={{ display: globalProgressState.visible ? "block" : "none" }} />
  )
}

export default GlobalProgress
