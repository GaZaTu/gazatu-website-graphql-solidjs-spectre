import { createOptions, createSelect } from "@thisbeyond/solid-select"
import classnames from "classnames"
import { ComponentProps, createEffect, createMemo, For, JSX, on, Show, splitProps, useContext } from "solid-js"
import A from "./A"
import "./Autocomplete.scss"
import Button from "./Button"
import Chip from "./Chip"
import FormContext from "./Form.Context"
import FormGroupContext from "./Form.Group.Context"
import Input from "./Input"
import Menu from "./Menu"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

interface CreateSelectPropsBase<V, O> {
  options: O[] | ((inputValue: string) => O[])
  disabled?: boolean
  optionToValue?: (option: O) => V
  isOptionDisabled?: (option: O) => boolean
  format: <T extends "option" | "value", I = T extends "option" ? O : V>(item: I, type: T) => JSX.Element
}

interface CreateSelectPropsSingle<V, O> extends CreateSelectPropsBase<V, O> {
  multiple?: false
  value?: V
  onChange?: (value: V) => void
}

interface CreateSelectPropsMultiple<V, O> extends CreateSelectPropsBase<V, O> {
  multiple: true
  value?: V[]
  onChange?: (value: V[]) => void
}

type CreateSelectProps<V, O> = CreateSelectPropsSingle<V, O> | CreateSelectPropsMultiple<V, O>

type Props<V, O> = CreateSelectProps<V, O> & {
  name?: string
  placeholder?: string
  hasError?: boolean
  readOnly?: boolean
  disabled?: boolean
  loading?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProps = createHTMLMemoHook((props: Props<any, any>) => {
  return {
    get class() {
      return classnames({
        "form-autocomplete": true,
      })
    },
  }
})

function Autocomplete<V, O>(props: Props<V, O> & Omit<ComponentProps<"div">, "onChange">) {
  const [_props] = createProps(props, {
    format: v => JSON.stringify(v),
  })

  const [inputProps, selectProps, containerProps] = splitProps(_props, [
    "placeholder",
    "hasError",
    "readOnly",
  ], [
    "options",
    "disabled",
    "loading",
    "multiple",
    "optionToValue",
    "isOptionDisabled",
    "value",
    "onchange",
    "onChange",
    "format",
  ])

  const form = useContext(FormContext)

  const formGroup = useContext(FormGroupContext)
  createEffect(() => {
    formGroup.setInputId(_props.id)
    formGroup.setInputName(_props.name)
  })

  const value = createMemo(() => {
    if (_props.value !== undefined) {
      return _props.value
    }

    return form.getValue(_props.name ?? "") ?? ""
  })

  const handleChange: (typeof selectProps)["onChange"] = (v: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selectProps.onChange as any)?.(v)

    if (!_props.name) {
      return
    }

    form.setValue(_props.name, v)
  }

  const handleBlur: ComponentProps<"input">["onblur"] = ev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_props.onblur as any)?.(ev)

    if (ev.cancelBubble) {
      return
    }

    if (!_props.name) {
      return
    }

    form.setTouched(_props.name, true)
  }

  const select = createSelect(selectProps)

  createEffect(
    on(value, v => v !== undefined && select.setValue(v))
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createChip = (value: any, onremove: () => void) => {
    return (
      <Chip>
        {selectProps.format?.(value, "value")}
        <Show when={!select.disabled}>
          <Button type="button" clear onclick={onremove} />
        </Show>
      </Chip>
    )
  }

  return (
    <div {...containerProps} ref={select.containerRef}>
      <div class={`form-autocomplete-input form-input ${select.disabled ? "disabled" : ""}`}>
        <Show when={select.hasValue}>
          <Show when={select.multiple}>
            <For each={select.value}>
              {(part, index) => createChip(part, () => select.setValue([...select.value.slice(0, index()), ...select.value.slice(index() + 1)]))}
            </For>
          </Show>

          <Show when={!select.multiple}>
            {createChip(select.value, () => select.setValue(undefined))}
          </Show>
        </Show>

        <Input {...inputProps} type="text" ref={select.inputRef} value={select.inputValue} disabled={select.disabled} loading={selectProps.loading} placeholder={!select.hasValue ? inputProps.placeholder : ""} />
      </div>

      <Show when={select.isOpen}>
        <Menu ref={select.listRef} style={{ "max-height": "33vh", "overflow-y": "auto" }}>
          <Show when={!selectProps.loading} fallback={<Menu.Item>Loading...</Menu.Item>}>
            <For each={select.options} fallback={<Menu.Item>Nothing here</Menu.Item>}>
              {option => (
                <Option focused={select.isOptionFocused(option)} disabled={select.isOptionDisabled(option)} onclick={() => select.pickOption(option)}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {selectProps.format?.(option as any, "option")}
                </Option>
              )}
            </For>
          </Show>
        </Menu>
      </Show>
    </div>
  )
}

export default Object.assign(Autocomplete, {
  createOptions,
})

type OptionProps = {
  focused?: boolean
  disabled?: boolean
  onclick?: () => void
  children?: JSX.Element
}

const Option = (props: OptionProps) => {
  const scrollIntoViewOnFocus = (element: HTMLElement) => {
    createEffect(() => {
      if (props.focused) {
        element.scrollIntoView({ block: "nearest" })
      }
    })
  }

  return (
    <Menu.Item ref={scrollIntoViewOnFocus} focused={props.focused} disabled={props.disabled} onclick={props.onclick}>
      <A href="#">
        {props.children}
      </A>
    </Menu.Item>
  )
}
