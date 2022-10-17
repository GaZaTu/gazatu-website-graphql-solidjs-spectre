import classnames from "classnames"
import { ComponentProps, createRenderEffect, Show, splitProps, useContext } from "solid-js"
import FormGroupContext from "./Form.Group.Context"
import "./Switch.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/checkbox-radio-switch.scss"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-switch": true,
        [`input-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Switch(props: Props & ComponentProps<"input">) {
  const [containerProps, inputProps] = splitProps(props, [
    "children",
    "class",
    "classList",
    "style",
    "size",
    "hasError",
  ])

  const [_containerProps] = createProps(containerProps)

  const formGroup = useContext(FormGroupContext)
  createRenderEffect(() => {
    formGroup.setInputId(inputProps.id)
    formGroup.setInputName(inputProps.name)

    formGroup.setLabelHidden(true)
  })

  return (
    <label {..._containerProps}>
      <input {...inputProps} type="checkbox" />
      <i class="form-icon" />
      {containerProps.children}
      <Show when={formGroup.label() || formGroup.labelAsString()}>
        {formGroup.label() ?? formGroup.labelAsString()}
      </Show>
    </label>
  )
}

export default Object.assign(Switch, {
})
