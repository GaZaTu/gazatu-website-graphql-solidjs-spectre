import { createVisibilityObserver } from "@solid-primitives/intersection-observer"
import { ComponentProps, createEffect, createSignal, Show, splitProps } from "solid-js"
import Icon from "./Icon"
import Img from "./Img"
import LoadingPlaceholder from "./LoadingPlaceholder"
import readFile from "./util/readFile"

type Props = {
  useFetch?: boolean
}

function ImgWithPlaceholder(_props: Props & ComponentProps<typeof Img>) {
  const [fml, props] = splitProps(_props, ["src", "useFetch"])

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
    const {
      src,
      useFetch,
    } = fml

    if (!src || !visible() || loaded()) {
      return
    }

    if (!useFetch) {
      setSrc(src)
      return
    }

    const response = await fetch(src)
    const blob = await response.blob()
    const url = await readFile(blob, { how: "readAsDataURL" })

    setSrc(url)
    setLoading(false)
  })

  const onload = () => {
    if (fml.useFetch) {
      return
    }

    setLoading(false)
  }

  return (
    <>
      <div style={{ display: loaded() ? "flex" : "none" }}>
        <Img {...props} src={src()} onload={onload} style={props.style} />
      </div>

      <Show when={loading()} fallback={<SetLoaded />}>
        <LoadingPlaceholder ref={setPlaceholder} width={props.width} height={props.height} style2={props.style}>
          <Icon src={Icon.Context.iconPhoto} />
        </LoadingPlaceholder>
      </Show>
    </>
  )
}

export default Object.assign(ImgWithPlaceholder, {
})
