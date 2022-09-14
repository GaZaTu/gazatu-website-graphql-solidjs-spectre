import { createContext } from "solid-js"

const FormContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValue: ((name: string) => undefined as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getError: ((name: string) => undefined as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: ((name: string, value: any) => undefined as void),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTouched: ((name: string, touched: boolean) => undefined as void),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isRequired: ((name: string) => false as boolean),

  horizontal: false as boolean,
})

export default Object.assign(FormContext, {
})
