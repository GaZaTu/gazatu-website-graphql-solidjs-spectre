// https://github.com/lxsmnsyc/solid-headless/blob/main/packages/solid-headless/src/components/toast/ToasterStore.ts

import { createEffect, createSignal, onCleanup } from "solid-js"

export interface ToastData<T> {
  id: string
  data: T
}

export type ToasterListener<T> = (queue: ToastData<T>[]) => void

export class ToasterStore<T> {
  private static toasterId = 0

  private id: number

  private queue: ToastData<T>[] = []

  private listeners = new Set<ToasterListener<T>>()

  private toastID = 0

  constructor() {
    this.id = ToasterStore.toasterId++
  }

  subscribe(callback: ToasterListener<T>) {
    this.listeners.add(callback)

    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    const clone = [...this.queue]

    for (const listener of this.listeners.keys()) {
      listener(clone)
    }
  }

  create(data: T) {
    const id = `toast-${this.id}-[${this.toastID}`

    this.toastID += 1
    this.queue.push({ id, data })
    this.notify()

    return id
  }

  remove(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id)
    this.notify()
  }

  clear() {
    this.queue = []
    this.notify()
  }

  getQueue() {
    return this.queue
  }
}

export function useToaster<T>(toaster: ToasterStore<T>) {
  const [signal, setSignal] = createSignal(toaster.getQueue())

  createEffect(() => {
    onCleanup(toaster.subscribe(setSignal))
  })

  return signal
}
