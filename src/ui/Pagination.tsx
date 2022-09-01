import classnames from "classnames"
import { ComponentProps, createMemo, For } from "solid-js"
import Icon from "./Icon"
import iconArrowLeft from "./icons/iconArrowLeft"
import iconArrowRight from "./icons/iconArrowRight"
import PaginationItem from "./Pagination.Item"
import "./Pagination.scss"
import createHTMLMemoHook from "./util/createHTMLMemoHook"

type Props = {
  firstIndex?: 0 | 1
  pageIndex?: number
  pageCount?: number
  pageSize?: number
  onPageIndexChange?: (pageIndex: number) => void
  canNext?: boolean
  canPrev?: boolean
  loading?: boolean
  useQuery?: boolean
  compact?: boolean
}

const createProps = createHTMLMemoHook((props: Props) => {
  return {
    get class() {
      return classnames({
        "pagination": true,
        "pagination-compact": props.compact,
      })
    },
  }
})

function Pagination(props: Props & ComponentProps<"nav">) {
  const [_props] = createProps(props)

  const pages = createMemo(() => {
    const pages = [] as number[]
    const firstIndex = _props.firstIndex ?? 0
    const pageIndex = _props.pageIndex ?? 0
    const pageCount = _props.pageCount ?? 0

    for (let i = firstIndex; i < pageCount; i++) {
      if (i === firstIndex) {
        pages.push(i)
      } else if (i === pageIndex - 2) {
        pages.push(-1)
        pages.push(i)
      } else if (i === pageIndex - 1) {
        pages.push(i)
      } else if (i === pageIndex) {
        pages.push(i)
      } else if (i === pageIndex + 1) {
        pages.push(i)
      } else if (i === pageIndex + 2) {
        pages.push(i)
      } else if (i === pageCount - 1) {
        if ((i - pageIndex + 1) > 1) {
          pages.push(-1)
        }

        pages.push(i)
      }
    }

    return pages
  })

  // const location = A.Context.useLocation()
  // const navigate = A.Context.useNavigate()

  const onclick: ComponentProps<"li">["onclick"] = (event) => {
    const page = event.currentTarget.dataset.page
    if (!page) {
      return
    }

    event.stopPropagation()
    _props.onPageIndexChange?.(Number(page))
  }

  const canPrev = createMemo(() => {
    if (_props.canPrev !== undefined) {
      return _props.canPrev
    }

    return (_props.pageIndex ?? _props.firstIndex ?? 0) > (_props.firstIndex ?? 0)
  })

  const canNext = createMemo(() => {
    if (_props.canNext !== undefined) {
      return _props.canNext
    }

    return (_props.pageIndex ?? _props.firstIndex ?? 0) < ((_props.pageCount ?? 0) - 1)
  })

  return (
    <nav {..._props}>
      {/* <Show when={_props.hasPrev} /> */}
      <PaginationItem data-page={(_props.pageIndex ?? 0) - 1} onclick={onclick} disabled={!canPrev()}>
        <Icon src={iconArrowLeft} />
      </PaginationItem>

      <ul>
        <For each={pages()}>
          {page => (
            <PaginationItem data-page={page} onclick={(page >= 0) ? onclick : undefined} active={page === (_props.pageIndex ?? 0)}>
              {(page >= 0) ? String(page + (((_props.firstIndex ?? 0) === 0) ? 1 : 0)) : "..."}
            </PaginationItem>
          )}
        </For>
      </ul>

      {/* <Show when={_props.hasNext} /> */}
      <PaginationItem data-page={(_props.pageIndex ?? 0) + 1} onclick={onclick} disabled={!canNext()}>
        <Icon src={iconArrowRight} />
      </PaginationItem>
    </nav>
  )
}

export default Object.assign(Pagination, {
  createProps,
  Item: PaginationItem,
})
