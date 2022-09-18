// https://github.com/lxsmnsyc/solid-headless/blob/main/packages/solid-headless/src/components/toast/ToasterStore.ts

import { createEffect, createSignal, onCleanup } from "solid-js"

export interface ModalData<T> {
  id: string
  data: T
}

export type ModalListener<T> = (queue: ModalData<T>[]) => void

export class ModalStore<T> {
  private static modalId = 0

  private id: number

  private queue: ModalData<T>[] = []

  private listeners = new Set<ModalListener<T>>()

  private modalId = 0

  constructor() {
    this.id = ModalStore.modalId++
  }

  subscribe(callback: ModalListener<T>) {
    this.listeners.add(callback)

    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    const clone = [...this.queue]

    for (const listener of this.listeners) {
      listener(clone)
    }
  }

  create(data: T) {
    const id = `modal-${this.id}-[${this.modalId}`

    this.modalId += 1
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

export function useModals<T>(modals: ModalStore<T>) {
  const [signal, setSignal] = createSignal(modals.getQueue())

  createEffect(() => {
    onCleanup(modals.subscribe(setSignal))
  })

  return signal
}
