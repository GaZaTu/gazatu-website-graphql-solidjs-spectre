import classnames from "classnames"
import { ComponentProps, splitProps } from "solid-js"
import A from "./A"
import "./Pagination.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  isPrev?: boolean
  isNext?: boolean
  active?: boolean
  disabled?: boolean

  queryParams?: ComponentProps<typeof A>["params"]
  onclick?: ComponentProps<typeof A>["onclick"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "page-item": true,
        "page-prev": props.isPrev,
        "page-next": props.isNext,
        "active": props.active,
        "disabled": props.disabled,
      })
    },
  }
})

function PaginationItem(props: Props & Omit<ComponentProps<"li">, "onclick">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <li {..._props} onclick={undefined}>
      {(props.queryParams || props.onclick) && (
        <A href="" params={props.queryParams} keepExistingParams onclick={props.onclick} tabIndex={props.disabled ? -1 : undefined}>{fml.children}</A>
      )}
      {(!props.queryParams && !props.onclick) && (
        <span>{fml.children}</span>
      )}
    </li>
  )
}

export default Object.assign(PaginationItem, {
  createProps,
})
