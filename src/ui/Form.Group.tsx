import { ComponentProps, JSX } from "solid-js"
import "./Form.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean

  label?: JSX.Element | ((labelAsString?: string) => JSX.Element)
  labelAsString?: string
  hint?: JSX.Element
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "form-group": true,
      [`form-group-${props.size}`]: !!props.size,
      "has-error": props.hasError,
    },
  }
})

function FormGroup(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  return (
    <div {..._props}>
      {(props.label || props.labelAsString) && (
        <label class="form-input-label">{(() => {
          if (!props.label) {
            return props.labelAsString
          }

          if (typeof props.label === "function") {
            return props.label(props.labelAsString)
          }

          return props.label
        })()}</label>
      )}
      {_children()}
      {props.hint && (
        <small class="form-input-hint">{props.hint}</small>
      )}
    </div>
  )
}

export default Object.assign(FormGroup, {
  createProps,
})
