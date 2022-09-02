import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import "./Checkbox.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/checkbox-radio.scss"
import "./util/form-mixins/checkbox-radio-switch.scss"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean

  indeterminate?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-checkbox": true,
        [`input-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Checkbox(props: Props & ComponentProps<"input">) {
  const [containerProps, inputProps] = splitProps(props, [
    "children",
    "class",
    "classList",
    "style",
    "size",
    "hasError",
  ])

  const [_containerProps] = createProps(containerProps)

  return (
    <label {..._containerProps}>
      <input {...inputProps} type="checkbox" />
      <i class="form-icon" />
      {containerProps.children}
    </label>
  )
}

export default Object.assign(Checkbox, {
})
