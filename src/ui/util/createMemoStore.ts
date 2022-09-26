import { createEffect } from "solid-js"
import { createStore } from "solid-js/store"
import type { EffectFunction, NoInfer } from "solid-js/types/reactive/signal"

const createMemoStore = <Next extends Prev, Prev extends {} = Next>(fn: EffectFunction<undefined | NoInfer<Prev>, Next>) => {
  const [store, setStore] = createStore<Next>({} as any)
  createEffect(() => {
    setStore(fn(store))
  })

  return store
}

export default createMemoStore
