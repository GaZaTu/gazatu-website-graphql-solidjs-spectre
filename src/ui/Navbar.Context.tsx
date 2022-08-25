import { Accessor, createContext, Setter } from "solid-js"

const NavbarContext = createContext({
  expanded: (() => false) as Accessor<boolean>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setExpanded: ((v: boolean) => { console.log("NO") }) as Setter<boolean>,
})

export default Object.assign(NavbarContext, {
})
