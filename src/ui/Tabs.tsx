import { ComponentProps } from "solid-js"
import TabsItem from "./Tabs.Item"
import TabsRadioGroup from "./Tabs.RadioGroup"
import "./Tabs.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "tabs": true,
    },
  }
})

function Steps(props: Props & ComponentProps<"ul">) {
  const [_props, _children] = createProps(props)

  return (
    <ul {..._props}>
      {_children()}
    </ul>
  )
}

export default Object.assign(Steps, {
  createProps,
  Item: TabsItem,
  RadioGroup: TabsRadioGroup,
})
