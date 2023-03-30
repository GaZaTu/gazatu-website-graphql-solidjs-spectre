import classNames from "classnames"
import { Component, ComponentProps, createMemo, createRenderEffect, JSX, Show, splitProps, useContext } from "solid-js"
import Button from "./Button"
import "./CheckboxButton.scss"
import FormContext from "./Form.Context"
import FormGroupContext from "./Form.Group.Context"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

const Defaults = {
  IfTrue: (() => undefined) as Component,
  IfFalse: (() => undefined) as Component,
  IfIndeterminate: (() => undefined) as Component,
}

type Props = {
  checked?: boolean
  indeterminate?: boolean
  ifTrue?: JSX.Element
  ifFalse?: JSX.Element
  ifIndeterminate?: JSX.Element
  onblur?: ComponentProps<typeof Button>["onclick"]
  oninput?: ComponentProps<typeof Button>["onclick"]
  onclick?: ComponentProps<typeof Button>["onclick"]
  reversed?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classNames({
        "form-checkbox-button": true,
      })
    },
  }
})

function IconCheckbox(props: Props & ComponentProps<typeof Button>) {
  const [fml, _props] = splitProps(props, ["children", "ifTrue", "ifFalse", "ifIndeterminate", "onblur", "oninput", "onclick"])

  const [__props] = createProps(_props)

  const form = useContext(FormContext)

  const formGroup = useContext(FormGroupContext)
  createRenderEffect(() => {
    formGroup.setInputId(props.id)
    formGroup.setInputName(props.name)

    formGroup.setLabelHidden(true)
  })

  const checked = createMemo(() => {
    if (props.checked !== undefined) {
      return props.checked
    }

    if (!props.name) {
      return undefined
    }

    const checked = form.getValue(props.name) ?? false
    return checked
  })

  const handleClick: ComponentProps<typeof Button>["onclick"] = ev => {
    void (fml.onblur as any)?.(ev)
    void (fml.oninput as any)?.(ev)
    void (fml.onclick as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!props.name) {
      return
    }

    form.setTouched(props.name, true)
    form.setValue(props.name, !checked())
  }

  const label = createMemo(() => {
    const raw = formGroup.label()
    const str = formGroup.labelAsString()
    return raw ?? str
  })

  return (
    <Button type="button" color="transparent" action={!label()} circle={!label()} {...__props} onclick={handleClick}>
      <Show when={props.indeterminate} fallback={
        <Show when={(checked() && !props.reversed) || (!checked() && props.reversed)} fallback={
          ((fml.ifFalse ?? <Defaults.IfFalse />))
        }>
          {(fml.ifTrue ?? <Defaults.IfTrue />)}
        </Show>
      }>
        {(fml.ifIndeterminate ?? <Defaults.IfIndeterminate />)}
      </Show>
      <Show when={label()} fallback={fml.children}>
        <span>{label()}</span>
      </Show>
    </Button>
  )
}

export default Object.assign(IconCheckbox, {
  Defaults,
})
