import classnames from "classnames"
import { ComponentProps, createSignal, JSX, Show, splitProps, useContext } from "solid-js"
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
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-group": true,
        [`form-group-${props.size}`]: !!props.size,
        "has-error": props.hasError,
      })
    },
  }
})

function FormGroup(props: Props & ComponentProps<"div">) {
  const [inputId, setInputId] = createSignal<string>()
  const [inputName, setInputName] = createSignal<string>()

  const form = useContext(FormContext)

  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props, {
    get hasError() {
      return !!form.getError(inputName() ?? "")
    },
    get hint() {
      return form.getError(inputName() ?? "")
    },
  })

  const context: ComponentProps<typeof FormGroupContext.Provider>["value"] = {
    labelAsString: () => {
      if (typeof _props.label === "string") {
        return _props.label
      }

      if (_props.labelAsString) {
        return _props.labelAsString
      }

      return ""
    },
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
      <Show when={_props.label || _props.labelAsString}>
        <label class="form-label" for={inputId()}>{labelContent()}</label>
      </Show>
    )
  }

  const createHint = () => {
    return (
      <Show when={_props.hint}>
        <small class="form-input-hint">{_props.hint}</small>
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
              {createHint()}
            </Column>
          </Column.Row>
        </Show>

        <Show when={!_props.horizontal}>
          {createLabel()}
          {fml.children}
          {createHint()}
        </Show>
      </FormGroupContext.Provider>
    </div>
  )
}

export default Object.assign(FormGroup, {
  createProps,
  FormGroupContext,
})
