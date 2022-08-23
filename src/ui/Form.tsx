import { ComponentProps } from "solid-js"
import FormGroup from "./Form.Group"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  horizontal?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "form": true,
      "form-horizontal": props.horizontal,
    },
  }
})

function Form(props: Props & ComponentProps<"form">) {
  const [_props, _children] = createProps(props)

  return (
    <form {..._props}>
      {_children()}
    </form>
  )
}

export default Object.assign(Form, {
  createProps,
  Group: FormGroup,
})
