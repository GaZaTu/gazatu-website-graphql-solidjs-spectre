import { For, JSX } from "solid-js"
import Button from "./Button"
import Modal from "./Modal"
import { ModalStore, useModals } from "./Modal.Store"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalProps<T = any> = {
  resolve: (value?: T) => void
  reject: (error?: unknown) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModalComponent<T = any> = (props: ModalProps<T>) => JSX.Element

const modals = new ModalStore<{ Modal: ModalComponent, props: ModalProps }>()

function push<T>(Modal: ModalComponent<T>) {
  return new Promise<T>((resolve, reject) => {
    const id = modals.create({
      Modal,
      props: {
        resolve: v => {
          modals.remove(id)
          resolve(v)
        },
        reject: e => {
          modals.remove(id)
          reject(e)
        },
      },
    })

    const unsub = modals.subscribe(modals => {
      for (const modal of modals) {
        if (modal.id === id) {
          return
        }
      }

      unsub()
    })
  })
}

const confirm = (message: JSX.Element) => {
  return push<boolean>(modal => (
    <Modal onclose={() => modal.resolve(false)} active>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button color="primary" onclick={() => modal.resolve(true)}>OK</Button>
        <Button color="link" onclick={() => modal.resolve(false)}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  ))
}

function ModalPortal(props: {}) {
  const notifs = useModals(modals)

  return (
    <div class="modal-portal">
      <For each={notifs()}>
        {({ data: { Modal, props } }) => (
          <Modal {...props} />
        )}
      </For>
    </div>
  )
}

export default Object.assign(ModalPortal, {
  modals,
  push,
  confirm,
})
