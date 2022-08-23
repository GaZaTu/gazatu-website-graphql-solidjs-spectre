import { ComponentProps } from "solid-js"
import A from "./A"
import ModalBody from "./Modal.Body"
import ModalContext from "./Modal.Context"
import ModalFooter from "./Modal.Footer"
import ModalHeader from "./Modal.Header"
import "./Modal.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  active?: boolean

  onclose?: ComponentProps<typeof A>["onclick"]
  oncloseHref?: ComponentProps<typeof A>["href"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "modal": true,
      [`modal-${props.size}`]: !!props.size,
      "active": props.active,
    },
  }
})

function Modal(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  const context = {
    active: () => !!props.active,
    onclose: () => props.onclose,
    oncloseHref: () => props.oncloseHref,
  }

  return (
    <div {..._props}>
      <A href={props.oncloseHref} onclick={props.onclose} />
      <div class="modal-container">
        <ModalContext.Provider value={context}>
          {_children()}
        </ModalContext.Provider>
      </div>
    </div>
  )
}

export default Object.assign(Modal, {
  createProps,
  Context: ModalContext,
  Body: ModalBody,
  Footer: ModalFooter,
  Header: ModalHeader,
})
