import { Accessor, createContext, Setter } from "solid-js"

const FormGroupContext = createContext({
  labelAsString: (() => undefined) as Accessor<string | undefined>,

  inputId: (() => undefined) as Accessor<string | undefined>,
  setInputId: (() => undefined) as Setter<string | undefined>,
})

export default Object.assign(FormGroupContext, {
})
