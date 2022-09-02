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

  href?: ComponentProps<typeof A>["href"]
  // onclick?: ComponentProps<typeof A>["onclick"]
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

function PaginationItem(props: Props & ComponentProps<"li">) {
  const [fml] = splitProps(props, ["children"])
  const [_props] = createProps(props)

  return (
    <li {..._props} onClick={undefined}>
      {(props.href || props.onclick) && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <A href={props.href} onclick={props.onclick as any} tabIndex={props.disabled ? -1 : undefined}>{fml.children}</A>
      )}
      {(!props.href && !props.onclick) && (
        <span>{fml.children}</span>
      )}
    </li>
  )
}

export default Object.assign(PaginationItem, {
  createProps,
})
