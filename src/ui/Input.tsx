import classnames from "classnames"
import { ComponentProps, Show } from "solid-js"
import Icon from "./Icon"
import "./Input.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/input-select.scss"
import { ThemeSize } from "./util/theming"

type Props = {
  size?: ThemeSize
  hasError?: boolean
  inline?: boolean

  iconSrc?: string
  iconLocation?: "left" | "right"
  loading?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "form-input": true,
        "input-inline": props.inline,
        [`input-${props.size}`]: !!props.size,
        "is-error": props.hasError,
      })
    },
  }
})

function Input(props: Props & ComponentProps<"input">) {
  const [_props, _children] = createProps(props)

  return (
    <>
      <Show when={props.loading || props.iconSrc}>
        <span class={`has-icon-${props.iconLocation ?? "right"}`}>
          <input {..._props} />
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          <Icon src={props.loading ? "loading" : props.iconSrc!} />
          {_children()}
        </span>
      </Show>

      <Show when={!props.iconSrc}>
        <input {..._props} />
        {_children()}
      </Show>
    </>
  )
}

export default Object.assign(Input, {
})
