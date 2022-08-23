import { createContext, createSignal, JSX } from "solid-js"

const AccordionRadioGroup = createContext({
  exists: () => false as boolean,
  activeId: () => undefined as string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setActiveId: (id: string | undefined) => {},
})

const _Provider = AccordionRadioGroup.Provider

type ProviderProps = {
  children?: JSX.Element
}

const Provider = (props: ProviderProps) => {
  const [activeId, setActiveId] = createSignal<string>()

  const context = {
    exists: () => true,
    activeId,
    setActiveId,
  }

  return (
    <_Provider value={context}>
      {props.children}
    </_Provider>
  )
}

export default Object.assign(AccordionRadioGroup, {
  Provider,
})
