import classnames from "classnames"
import { ComponentProps } from "solid-js"
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
  const [_props, _children] = createProps(props)

  // TODO: const radioGroup = useContext(TabsRadioGroup)
  // TODO: isDefault

  return (
    <li {..._props}>
      {_children()}
    </li>
  )
}

export default Object.assign(TabsItem, {
  createProps,
})
