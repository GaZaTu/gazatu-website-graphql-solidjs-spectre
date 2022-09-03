import { Accessor, createContext, JSX, Setter } from "solid-js"

const FormGroupContext = createContext({
  label: (() => undefined) as Accessor<JSX.Element | undefined>,
  labelAsString: (() => undefined) as Accessor<string | undefined>,
  setLabelHidden: (() => undefined) as Setter<boolean>,

  inputId: (() => undefined) as Accessor<string | undefined>,
  setInputId: (() => undefined) as Setter<string | undefined>,

  inputName: (() => undefined) as Accessor<string | undefined>,
  setInputName: (() => undefined) as Setter<string | undefined>,
})

export default Object.assign(FormGroupContext, {
})
