import { CellContext, ColumnDef, ColumnDefTemplate, OnChangeFn, Row, TableState } from "@tanstack/solid-table"
import { ComponentProps, createEffect } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import A from "./A"
import Button from "./Button"
import Checkbox from "./Checkbox"
import Icon from "./Icon"
import iconOpen from "./icons/iconOpen"
import { centerChildren, centerSelf } from "./util/position"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableDateCell = (...[locales, options]: Parameters<typeof Intl.DateTimeFormat>): ColumnDefTemplate<CellContext<any, any>> => {
  const dateFormat = new Intl.DateTimeFormat(locales, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  })

  return info => () => {
    const value = info.getValue()
    if (!value) {
      return ""
    }

    const asDate = new Date(value)
    const asString = dateFormat.format(asDate)

    return asString
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableColumnSelect = (): ColumnDef<any, any> => ({
  id: "__select",
  meta: { compact: true },
  header: info => (
    <Checkbox checked={info.table.getIsAllPageRowsSelected()} indeterminate={info.table.getIsSomePageRowsSelected()} onclick={info.table.getToggleAllPageRowsSelectedHandler()} classList={{ ...centerChildren(true) }} />
  ),
  cell: info => (
    <Checkbox checked={info.row.getIsSelected()} onclick={info.row.getToggleSelectedHandler()} disabled={!info.row.getCanSelect()} classList={{ ...centerChildren(true) }} />
  ),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableColumnLink = (getProps: (row: Row<any>) => ComponentProps<typeof Button.A>): ColumnDef<any, any> => ({
  id: "__link",
  meta: { compact: true },
  cell: info => (
    <Button.A {...getProps(info.row)} classList={{ ...centerSelf(true) }} action>
      <Icon src={iconOpen} />
    </Button.A>
  ),
})

const tableOnAnyStateChange = <K extends keyof TableState>(key: K) =>
  (setTableState: SetStoreFunction<Partial<TableState>>): OnChangeFn<TableState[K]> =>
    v => {
      if (typeof v === "function") {
        setTableState(state => ({
          ...state,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key]: (v as any)(state[key]!),
        }))
      } else {
        setTableState(state => ({
          ...state,
          [key]: v,
        }))
      }
    }

const tableOnPaginationChange = tableOnAnyStateChange("pagination")

const tableOnSortingChange = tableOnAnyStateChange("sorting")

const tableOnGlobalFilterChange = tableOnAnyStateChange("globalFilter")

const createTableState = (options?: { useSearchParams?: boolean }) => {
  const location = A.Context.useLocation()
  const navigate = A.Context.useNavigate()

  const getSearchParam = (key: string, def: InstanceType<typeof type>, type: (typeof String) | (typeof Number)) => {
    if (!options?.useSearchParams) {
      return def
    }

    return type(new URLSearchParams(location?.search).get(key) ?? def)
  }

  const setSearchParam = (key: string, def: typeof value, params: URLSearchParams, value: string | number) => {
    if (!options?.useSearchParams) {
      return
    }

    const q = value ?? def
    if (q === def) {
      params.delete(key)
    } else {
      params.set(key, String(q))
    }
  }

  const [tableState, setTableState] = createStore<Partial<TableState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 25,
    },
    sorting: [],
    globalFilter: getSearchParam("q", "", String),
  })

  createEffect(() => {
    if (!options?.useSearchParams) {
      return
    }

    const query = new URLSearchParams(location?.search)
    setSearchParam("q", "", query, tableState.globalFilter)

    navigate?.(`?${query}`, {
      scroll: false,
    })
  })

  return [tableState, setTableState] as const
}

export {
  tableDateCell,
  tableColumnSelect,
  tableColumnLink,
  tableOnPaginationChange,
  tableOnSortingChange,
  tableOnGlobalFilterChange,
  createTableState,
}