import { ComponentProps, createSignal, Show } from "solid-js"
import Icon from "./Icon"
import iconPhoto from "./icons/iconPhoto"
import Img from "./Img"
import LoadingPlaceholder from "./LoadingPlaceholder"

function ImgWithPlaceholder(props: ComponentProps<typeof Img>) {
  const [loading, setLoading] = createSignal(true)

  return (
    <>
      <Show when={loading()}>
        <LoadingPlaceholder width={props.width} height={props.height} style2={props.style}>
          <Icon src={iconPhoto} />
        </LoadingPlaceholder>
      </Show>

      <div style={{ display: "flex" }}>
        <Img {...props} onload={() => setLoading(false)} style={{ display: loading() ? "none" : undefined, ...(props.style as any) }} />
      </div>
    </>
  )
}

export default Object.assign(ImgWithPlaceholder, {
})
