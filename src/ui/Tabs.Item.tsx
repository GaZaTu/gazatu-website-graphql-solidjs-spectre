import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Tabs.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  hasAction?: boolean
  active?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "tabs-item": true,
        "tabs-action": props.hasAction,
        "active": props.active,
      })
    },
  }
})

function TabsItem(props: Props & ComponentProps<"li">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  // TODO: const radioGroup = useContext(TabsRadioGroup)
  // TODO: isDefault

  return (
    <li {..._props}>
      {fml.children}
    </li>
  )
}

export default Object.assign(TabsItem, {
  createProps,
})
