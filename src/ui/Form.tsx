import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import FormGroup from "./Form.Group"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  horizontal?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form": true,
        "form-horizontal": props.horizontal,
      })
    },
  }
})

function Form(props: Props & ComponentProps<"form">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <form {..._props}>
      {fml.children}
    </form>
  )
}

export default Object.assign(Form, {
  createProps,
  Group: FormGroup,
})
