import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import TabsItem from "./Tabs.Item"
import TabsRadioGroup from "./Tabs.RadioGroup"
import "./Tabs.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "tabs": true,
      })
    },
  }
})

function Steps(props: Props & ComponentProps<"ul">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <ul {..._props}>
      {fml.children}
    </ul>
  )
}

export default Object.assign(Steps, {
  createProps,
  Item: TabsItem,
  RadioGroup: TabsRadioGroup,
})
