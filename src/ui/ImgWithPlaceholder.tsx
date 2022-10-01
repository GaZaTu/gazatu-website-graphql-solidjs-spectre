import { ComponentProps, createEffect, createSignal, Show, splitProps } from "solid-js"
import readFile from "../lib/readFile"
import Icon from "./Icon"
import iconPhoto from "./icons/iconPhoto"
import Img from "./Img"
import LoadingPlaceholder from "./LoadingPlaceholder"

type Props = {
  useFetch?: boolean
}

function ImgWithPlaceholder(_props: Props & ComponentProps<typeof Img>) {
  const [fml, props] = splitProps(_props, ["src"])

  const [loading, setLoading] = createSignal(true)
  const [visible, setVisible] = createSignal(false)

  const [src, setSrc] = createSignal<string>()

  const SetVisible = () => {
    console.log("setVisible")
    setVisible(true)
    return null
  }

  createEffect(async () => {
    if (!fml.src) {
      return
    }

    if (!props.useFetch) {
      setSrc(fml.src)
      return
    }

    const response = await fetch(fml.src)
    const blob = await response.blob()
    const src = await readFile(blob, { how: "readAsDataURL" })

    setSrc(src)
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
        <Img {...props} src={src()} onload={onload} style={{ display: visible() ? "block" : "none", ...(props.style as any) }} />
      </div>

      <Show when={loading()} fallback={<SetVisible />}>
        <LoadingPlaceholder width={props.width} height={props.height} style2={props.style}>
          <Icon src={iconPhoto} />
        </LoadingPlaceholder>
      </Show>
    </>
  )
}

export default Object.assign(ImgWithPlaceholder, {
})
