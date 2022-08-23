import { ComponentProps } from "solid-js"
import A from "./A"
import "./Pagination.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  isPrev?: boolean
  isNext?: boolean
  active?: boolean
  disabled?: boolean

  href?: ComponentProps<typeof A>["href"]
  onclick?: ComponentProps<typeof A>["onclick"]
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    classList: {
      "page-item": true,
      "page-prev": props.isPrev,
      "page-next": props.isNext,
    },
  }
})

function PaginationItem(props: Props & ComponentProps<"li">) {
  const [_props, _children] = createProps(props)

  return (
    <li {..._props} onClick={undefined}>
      {(props.href || props.onclick) && (
        <A href={props.href} onclick={props.onclick} tabIndex={props.disabled ? -1 : undefined}>{_children()}</A>
      )}
      {(!props.href && !props.onclick) && (
        _children()
      )}
    </li>
  )
}

export default Object.assign(PaginationItem, {
  createProps,
})
