import { ComponentProps, createEffect, For, JSX, Show, splitProps } from "solid-js"
import Button from "./Button"
import Code from "./Code"
import Toast from "./Toast"
import "./Toaster.scss"
import { ToasterStore, useToaster } from "./Toaster.Store"

const notifications = new ToasterStore<Partial<ComponentProps<typeof ToastWithAnimation>>>()

const pushNotification = (props: Partial<ComponentProps<typeof ToastWithAnimation>>) => {
  return notifications.create({
    timeout: 15000,
    closable: true,
    ...props,
  })
}

const pushSuccess = (message: string) => {
  pushNotification({
    color: "success",
    children: message,
  })

  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pushError = (error: any, onclose?: () => void) => {
  if (import.meta.env.PROD) {
    error = error?.message ?? String(error)
  } else {
    error = (
      <Code snippet>{error?.stack ?? String(error)}</Code>
    )
  }

  pushNotification({
    color: "failure",
    children: error,
    onclose,
  })

  return undefined
}

function Toaster(props: {}) {
  const notifs = useToaster(notifications)

  return (
    <div class="toaster">
      <For each={notifs()}>
        {item => (
          <ToastWithAnimation {...item.data} id={item.id} />
        )}
      </For>
    </div>
  )
}

export default Object.assign(Toaster, {
  notifications,
  push: pushNotification,
  pushSuccess,
  pushError,
})

type ToastWithAnimationProps = {
  id: string
  closable?: boolean
  timeout?: number
  children?: JSX.Element
  onclose?: () => void
}

function ToastWithAnimation(props: ToastWithAnimationProps & ComponentProps<typeof Toast>) {
  const [localProps, toastProps] = splitProps(props, [
    "closable",
    "timeout",
    "children",
    "onclose",
  ])

  const dispose = () => {
    localProps.onclose?.()
    notifications.remove(toastProps.id)
  }

  createEffect(() => {
    if (!localProps.timeout) {
      return
    }

    setTimeout(dispose, localProps.timeout)
  })

  return (
    <Toast {...toastProps}>
      <Show when={localProps.closable}>
        <Button clear style={{ float: "right" }} onclick={dispose} />
      </Show>

      <Show when={(typeof localProps.children === "string")} fallback={localProps.children}>
        <p>{localProps.children}</p>
      </Show>
    </Toast>
  )
}