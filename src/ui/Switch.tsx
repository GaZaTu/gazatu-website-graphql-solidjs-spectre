import { ComponentProps, splitProps } from "solid-js"
import "./Switch.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/checkbox-radio-switch"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "form-switch": true,
      [`input-${props.size}`]: !!props.size,
      "is-error": props.hasError,
    },
  }
})

function Checkbox(props: Props & ComponentProps<"input">) {
  const [containerProps, inputProps] = splitProps(props, [
    "class",
    "classList",
    "style",
    "size",
    "hasError",
  ])

  const [_containerProps, _children] = createProps(containerProps)

  return (
    <label {..._containerProps}>
      <input {...inputProps} type="checkbox" />
      <i class="form-icon" />
      {_children()}
    </label>
  )
}

export default Object.assign(Checkbox, {
})