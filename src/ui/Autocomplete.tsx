import { createOptions, createSelect } from "@thisbeyond/solid-select"
import classnames from "classnames"
import { ComponentProps, createEffect, For, JSX, on, Show, splitProps } from "solid-js"
import A from "./A"
import "./Autocomplete.scss"
import Button from "./Button"
import Chip from "./Chip"
import Input from "./Input"
import Menu from "./Menu"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

interface CreateSelectPropsBase<V, O> {
  options: O[] | ((inputValue: string) => O[])
  disabled?: boolean
  optionToValue?: (option: O) => V
  isOptionDisabled?: (option: O) => boolean
  format: (item: O | V, type: "option" | "value") => JSX.Element
}

interface CreateSelectPropsSingle<V, O> extends CreateSelectPropsBase<V, O> {
  multiple?: false
  initialValue?: V
  onChange?: (value: V) => void
}

interface CreateSelectPropsMultiple<V, O> extends CreateSelectPropsBase<V, O> {
  multiple: true
  initialValue?: V[]
  onChange?: (value: V[]) => void
}

type CreateSelectProps<V, O> = CreateSelectPropsSingle<V, O> | CreateSelectPropsMultiple<V, O>

type Props<V, O> = CreateSelectProps<V, O> & {
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

function Autocomplete<V, O>(props: Props<V, O> & ComponentProps<"div">) {
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
    "initialValue",
    "onchange",
    "onChange",
    "format",
  ])

  const select = createSelect(selectProps)

  createEffect(
    on(
      () => selectProps.initialValue,
      (value) => value !== undefined && select.setValue(value),
    )
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
