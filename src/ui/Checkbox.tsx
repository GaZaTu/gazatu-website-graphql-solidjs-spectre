import classnames from "classnames"
import { ComponentProps, createEffect, createMemo, Show, splitProps, useContext } from "solid-js"
import "./Checkbox.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/checkbox-radio.scss"
import "./util/form-mixins/checkbox-radio-switch.scss"
import { ThemeSize } from "./util/theming"
import FormContext from "./Form.Context"
import FormGroupContext from "./Form.Group.Context"

type Props = {
  size?: ThemeSize
  hasError?: boolean

  indeterminate?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-checkbox": true,
        [`input-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Checkbox(props: Props & ComponentProps<"input">) {
  const [containerProps, inputProps] = splitProps(props, [
    "children",
    "class",
    "classList",
    "style",
    "size",
    "hasError",
  ])

  const [_containerProps] = createProps(containerProps)

  const form = useContext(FormContext)

  const formGroup = useContext(FormGroupContext)
  createEffect(() => {
    formGroup.setInputId(inputProps.id)
    formGroup.setInputName(inputProps.name)

    formGroup.setLabelHidden(true)
  })

  const value = createMemo(() => {
    if (inputProps.value !== undefined) {
      return inputProps.value
    }

    return form.getValue(inputProps.name ?? "") ?? false
  })

  const handleInput: ComponentProps<"input">["oninput"] = ev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inputProps.oninput as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!inputProps.name) {
      return
    }

    console.log("ev.currentTarget.value", ev.currentTarget.value)

    form.setValue(inputProps.name, ev.currentTarget.value)
  }

  const handleBlur: ComponentProps<"input">["onblur"] = ev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inputProps.onblur as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!inputProps.name) {
      return
    }

    form.setTouched(inputProps.name, true)
  }

  return (
    <label {..._containerProps}>
      <input value={value()} oninput={handleInput} onblur={handleBlur} {...inputProps} type="checkbox" />
      <i class="form-icon" />
      <Show when={formGroup.label() || formGroup.labelAsString()} fallback={containerProps.children}>
        {formGroup.label() ?? formGroup.labelAsString()}
      </Show>
    </label>
  )
}

export default Object.assign(Checkbox, {
})
