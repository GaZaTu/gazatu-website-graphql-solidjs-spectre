import classnames from "classnames"
import { ComponentProps } from "solid-js"
import "./Select.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/input-select"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-select": true,
        [`select-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Select(props: Props & ComponentProps<"select">) {
  const [_props, _children] = createProps(props)

  return (
    <select {..._props}>
      {_children()}
    </select>
  )
}

export default Object.assign(Select, {
})
