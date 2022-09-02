import { createForm } from "@felte/solid"
import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import FormContext from "./Form.Context"
import FormGroup from "./Form.Group"
import "./Label.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  horizontal?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any // ReturnType<typeof createForm>
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

  const form: ComponentProps<typeof FormContext.Provider>["value"] = {
    getValue: (name) => {
      return _props.context?.data(name)
    },
    getError: (name) => {
      return _props.context?.errors(name)?.[0]
    },
    setValue: (name, value) => {
      _props.context?.setFields(name, value)
    },
    setTouched: (name, touched) => {
      _props.context?.setTouched(name, touched)
    },
  }

  return (
    <form {..._props}>
      <FormContext.Provider value={form}>
        {fml.children}
      </FormContext.Provider>
    </form>
  )
}

export default Object.assign(Form, {
  createProps,
  createContext: createForm,
  Context: FormContext,
  Group: FormGroup,
})
