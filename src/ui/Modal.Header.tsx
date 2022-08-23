import { ComponentProps, useContext } from "solid-js"
import Button from "./Button"
import ModalContext from "./Modal.Context"
import "./Modal.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { float } from "./util/position"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "modal-header": true,
    },
  }
})

function ModalHeader(props: Props & ComponentProps<"section">) {
  const [_props, _children] = createProps(props)

  const {
    oncloseHref,
    onclose,
  } = useContext(ModalContext)

  return (
    <section {..._props}>
      <Button.A clear class={`${float("right")}`} href={oncloseHref()} onclick={onclose()} />
      {_children()}
    </section>
  )
}

export default Object.assign(ModalHeader, {
  createProps,
})
