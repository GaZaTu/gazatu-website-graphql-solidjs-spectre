import { ComponentProps, splitProps } from "solid-js"
import "./Radio.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/checkbox-radio"
import "./util/form-mixins/checkbox-radio-switch"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "form-radio": true,
      [`input-${props.size}`]: !!props.size,
      "is-error": props.hasError,
    },
  }
})

function Radio(props: Props & ComponentProps<"input">) {
  const [containerProps, inputProps] = splitProps(props, [
    "class",
    "classList",
    "style",
    "children",
    "size",
    "hasError",
  ])

  const [_containerProps, _children] = createProps(containerProps)

  return (
    <label {..._containerProps}>
      <input {...inputProps} type="radio" />
      <i class="form-icon" />
      {_children()}
    </label>
  )
}

export default Object.assign(Radio, {
})
