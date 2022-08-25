import { ComponentProps, splitProps } from "solid-js"
import "./Autocomplete.scss"
import Input from "./Input"
import createHTMLMemoHook from "./util/createHTMLMemoHook"
import "./util/form-mixins/input-select"

type Props = {
  placeholder?: string
  hasError?: boolean
  readOnly?: boolean
  disabled?: boolean
  loading?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "form-autocomplete": true,
    },
  }
})

function Autocomplete(props: Props & ComponentProps<"div">) {
  const [_props, _children] = createProps(props)

  const [inputProps, containerProps] = splitProps(_props, [
    "placeholder",
    "hasError",
    "readOnly",
    "disabled",
    "loading",
  ])

  return (
    <div {...containerProps}>
      <div class="form-autocomplete-input form-input">

        <div class="chip">
          <img src="img/avatar-1.png" class="avatar avatar-sm" alt="Thor Odinson" />
          Thor Odinson
          <a href="#" class="btn btn-clear" aria-label="Close" role="button" />
        </div>

        <Input {...inputProps} type="text" oninput={e => console.log(e)} />
      </div>

      {_children()}

      {/* <ul class="menu">
        <li class="menu-item">
          <a href="#">
            <div class="tile tile-centered">
              <div class="tile-icon">
                ...
              </div>
              <div class="tile-content">
                ...
              </div>
            </div>
          </a>
        </li>
      </ul> */}
    </div>
  )
}

export default Object.assign(Autocomplete, {
})
