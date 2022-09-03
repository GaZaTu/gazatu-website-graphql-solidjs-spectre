import classnames from "classnames"
import { ComponentProps, createEffect, createMemo, Show, splitProps, useContext } from "solid-js"
import FormContext from "./Form.Context"
import FormGroupContext from "./Form.Group.Context"
import Icon from "./Icon"
import "./Input.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/input-select.scss"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
  inline?: boolean

  iconSrc?: string
  iconLocation?: "left" | "right"
  loading?: boolean

  id?: string
  ifEmpty?: string | null
}

const createProps = createHTMLMemoHook((props: Props) => {
  const generatedId = Math.random().toString(36).substr(2, 10)

  return {
    get id() {
      return props.id ?? generatedId
    },
    get class() {
      return classnames({
        "form-input": true,
        "input-inline": props.inline,
        [`input-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Input(props: Props & ComponentProps<"input">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  const form = useContext(FormContext)

  const formGroup = useContext(FormGroupContext)
  createEffect(() => {
    formGroup.setInputId(_props.id)
    formGroup.setInputName(_props.name)
  })

  const value = createMemo(() => {
    if (_props.value !== undefined) {
      return _props.value
    }

    return form.getValue(_props.name ?? "") ?? ""
  })

  const handleInput: ComponentProps<"input">["oninput"] = ev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_props.oninput as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!_props.name) {
      return
    }

    let value = ev.currentTarget.value as string | null
    if (value === "" && _props.ifEmpty !== undefined) {
      value = _props.ifEmpty
    }

    form.setValue(_props.name, value)
  }

  const handleBlur: ComponentProps<"input">["onblur"] = ev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_props.onblur as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!_props.name) {
      return
    }

    form.setTouched(_props.name, true)
  }

  const createInput = () => (
    <input value={value()} oninput={handleInput} onblur={handleBlur} placeholder={formGroup.labelAsString()} {..._props} />
  )

  return (
    <>
      <Show when={props.loading || props.iconSrc}>
        <span class={`has-icon-${props.iconLocation ?? "right"}`}>
          {createInput()}
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          <Icon src={props.loading ? "loading" : props.iconSrc!} />
          {fml.children}
        </span>
      </Show>

      <Show when={!props.iconSrc}>
        {createInput()}
        {fml.children}
      </Show>
    </>
  )
}

export default Object.assign(Input, {
})
