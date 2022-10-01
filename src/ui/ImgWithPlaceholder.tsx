import { createVisibilityObserver } from "@solid-primitives/intersection-observer"
import { ComponentProps, createEffect, createSignal, Show, splitProps } from "solid-js"
import Icon from "./Icon"
import iconPhoto from "./icons/iconPhoto"
import Img from "./Img"
import LoadingPlaceholder from "./LoadingPlaceholder"
import readFile from "./util/readFile"

type Props = {
  useFetch?: boolean
}

function ImgWithPlaceholder(_props: Props & ComponentProps<typeof Img>) {
  const [fml, props] = splitProps(_props, ["src"])

  const [placeholder, setPlaceholder] = createSignal<HTMLElement>()
  const useVisibilityObserver = createVisibilityObserver()
  const visible = useVisibilityObserver(placeholder)

  const [loading, setLoading] = createSignal(true)
  const [loaded, setLoaded] = createSignal(false)

  const [src, setSrc] = createSignal<string>()

  const SetLoaded = () => {
    setLoaded(true)
    return null
  }

  createEffect(async () => {
    if (!fml.src || !visible() || loaded()) {
      return
    }

    if (!props.useFetch) {
      setSrc(fml.src)
      return
    }

    const response = await fetch(fml.src)
    const blob = await response.blob()
    const url = await readFile(blob, { how: "readAsDataURL" })

    setSrc(url)
    setLoading(false)
  })

  const onload = () => {
    if (props.useFetch) {
      return
    }

    setLoading(false)
  }

  return (
    <>
      <div style={{ display: "flex" }}>
        <Img {...props} src={src()} onload={onload} style={{ display: loaded() ? "block" : "none", ...(props.style as any) }} />
      </div>

      <Show when={loading()} fallback={<SetLoaded />}>
        <LoadingPlaceholder ref={setPlaceholder} width={props.width} height={props.height} style2={props.style}>
          <Icon src={iconPhoto} />
        </LoadingPlaceholder>
      </Show>
    </>
  )
}

export default Object.assign(ImgWithPlaceholder, {
})
