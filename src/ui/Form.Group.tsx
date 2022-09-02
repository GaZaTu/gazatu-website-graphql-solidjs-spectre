import classnames from "classnames"
import { ComponentProps, createSignal, JSX, Show, splitProps } from "solid-js"
import Column from "./Column"
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
        "form-group-horizontal": props.horizontal,
      })
    },
  }
})

function FormGroup(props: Props & ComponentProps<"div">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  const [inputId, setInputId] = createSignal<string>()
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
      <Show when={props.label || props.labelAsString}>
        <label class="form-label" for={inputId()}>{labelContent()}</label>
      </Show>
    )
  }

  const createHint = () => {
    return (
      <Show when={props.hint}>
        <small class="form-input-hint">{props.hint}</small>
      </Show>
    )
  }

  return (
    <div {..._props}>
      <FormGroupContext.Provider value={context}>
        <Show when={props.horizontal}>
          <Column xxl={3} sm={12}>
            {createLabel()}
          </Column>
          <Column xxl={9} sm={12}>
            {fml.children}
            {createHint()}
          </Column>
        </Show>

        <Show when={!props.horizontal}>
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
