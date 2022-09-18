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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pushSuccess = (message: any) => {
  pushNotification({
    color: "success",
    children: String(message),
  })

  return undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pushError = (error: any, onclose?: (() => void) | unknown) => {
  console.error(error)

  if (import.meta.env.PROD) {
    error = error?.message ?? String(error)
  } else {
    error = error ? `${error.name ?? "Error"}: ${error.message}\n\t${error.stack?.replaceAll("\n", "\n\t")}` : String(error)
    error = (
      <Code snippet>{error}</Code>
    )
  }

  pushNotification({
    color: "failure",
    children: error,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onclose: (typeof onclose === "function") ? (onclose as any) : undefined,
  })

  return undefined
}

function tryFunc<R>(func: () => R): R {
  try {
    const maybePromise = func()

    if (maybePromise instanceof Promise) {
      return (async () => {
        try {
          return await maybePromise
        } catch (error) {
          pushError(error)
          throw error
        }
      })() as R
    }

    return maybePromise
  } catch (error) {
    pushError(error)
    throw error
  }
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
  try: tryFunc,
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
