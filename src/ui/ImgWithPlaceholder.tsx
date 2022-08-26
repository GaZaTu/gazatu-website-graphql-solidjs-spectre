import { ComponentProps, createSignal, Show } from "solid-js"
import Img from "./Img"
import LoadingPlaceholder from "./LoadingPlaceholder"

function ImgWithPlaceholder(props: ComponentProps<typeof Img>) {
  const [loading, setLoading] = createSignal(true)

  return (
    <>
      <Show when={loading()}>
        <LoadingPlaceholder width={props.width} height={props.height} />
      </Show>

      <Img {...props} onload={() => setLoading(false)} style={{ display: loading() ? "none" : undefined }} />
    </>
  )
}

export default Object.assign(ImgWithPlaceholder, {
})
