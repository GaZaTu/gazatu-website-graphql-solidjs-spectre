import classnames from "classnames"
import { Accessor, ComponentProps, createMemo, createSignal, JSX, Show, splitProps, useContext } from "solid-js"
import Column from "./Column"
import FormContext from "./Form.Context"
import FormGroupContext from "./Form.Group.Context"
import "./Form.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean

  label?: JSX.Element | ((labelAsString?: string) => JSX.Element)
  labelAsString?: string
  hint?: JSX.Element

  horizontal?: boolean
  required?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-group": true,
        [`form-group-${props.size}`]: !!props.size,
        "form-group-required": !!props.required,
        "has-error": props.hasError,
      })
    },
  }
})

function FormGroup(props: Props & ComponentProps<"div">) {
  const [labelHidden, setLabelHidden] = createSignal(false)
  const [inputId, setInputId] = createSignal<string>()
  const [inputName, setInputName] = createSignal<string>()

  const form = useContext(FormContext)

  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props, {
    get hasError() {
      if (!inputName()) {
        return false
      }

      const error = form.getError(inputName()!)
      if (typeof error !== "string") {
        return false
      }

      return true
    },
    get required() {
      if (!inputName()) {
        return false
      }

      return !!form.isRequired(inputName()!)
    },
    get horizontal() {
      return !!form.horizontal
    },
  })

  const hint = createMemo(() => {
    return _props.hint
  })

  const error = createMemo(() => {
    if (!inputName()) {
      return undefined
    }

    const error = form.getError(inputName()!)
    if (typeof error !== "string") {
      return undefined
    }

    return error
  })

  const context: ComponentProps<typeof FormGroupContext.Provider>["value"] = {
    label: () => {
      return _props.label
    },
    labelAsString: () => {
      if (typeof _props.label === "string") {
        return _props.label
      }

      if (_props.labelAsString) {
        return _props.labelAsString
      }

      return ""
    },
    setLabelHidden,
    inputId,
    setInputId,
    inputName,
    setInputName,
  }

  const labelContent = () => {
    if (!_props.label) {
      return _props.labelAsString
    }

    if (typeof _props.label === "function") {
      return _props.label(_props.labelAsString)
    }

    return _props.label
  }

  const createLabel = () => {
    return (
      <Show when={(_props.label || _props.labelAsString) && !labelHidden()}>
        <label class="form-label" for={inputId()}>{labelContent()}</label>
      </Show>
    )
  }

  const createHint = (hint: Accessor<JSX.Element>) => {
    return (
      <Show when={hint()} keyed>
        {hint => (
          <small class="form-input-hint">{hint}</small>
        )}
      </Show>
    )
  }

  return (
    <div {..._props}>
      <FormGroupContext.Provider value={context}>
        <Show when={_props.horizontal}>
          <Column.Row>
            <Column xxl={3} sm={12}>
              {createLabel()}
            </Column>
            <Column xxl={9} sm={12}>
              {fml.children}
              {createHint(error)}
              {createHint(hint)}
            </Column>
          </Column.Row>
        </Show>

        <Show when={!_props.horizontal}>
          {createLabel()}
          {fml.children}
          {createHint(error)}
          {createHint(hint)}
        </Show>
      </FormGroupContext.Provider>
    </div>
  )
}

export default Object.assign(FormGroup, {
  createProps,
  FormGroupContext,
})
