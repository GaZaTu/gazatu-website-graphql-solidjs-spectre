import { CellContext, ColumnDef, ColumnDefTemplate, OnChangeFn, Row, TableState } from "@tanstack/solid-table"
import { ComponentProps, createEffect } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import A from "./A"
import Button from "./Button"
import Checkbox from "./Checkbox"
import Icon from "./Icon"
import iconOpen from "./icons/iconOpen"
import { centerChildren, centerSelf } from "./util/position"

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

const tableColumnSelect = <T, V>(): ColumnDef<T, V> => ({
  id: "__select",
  meta: { compact: true },
  header: info => (
    <Checkbox checked={info.table.getIsAllPageRowsSelected()} indeterminate={info.table.getIsSomePageRowsSelected()} onclick={info.table.getToggleAllPageRowsSelectedHandler()} classList={{ ...centerChildren(true) }} />
  ),
  cell: info => (
    <Checkbox checked={info.row.getIsSelected()} onclick={info.row.getToggleSelectedHandler()} disabled={!info.row.getCanSelect()} classList={{ ...centerChildren(true) }} />
  ),
})

const tableColumnLink = <T, V>(getProps: (row: Row<T>) => ComponentProps<typeof Button.A>): ColumnDef<T, V> => ({
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

const createTableState = (defaults: Partial<TableState>, options?: { useSearchParams?: boolean }) => {
  const location = A.Context.useLocation()
  const navigate = A.Context.useNavigate()

  const getSearchParam = <T extends {}>(key: string, def: string, type: (str: string) => T): T => {
    if (!options?.useSearchParams) {
      return type(def)
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
      pageIndex: Math.max(getSearchParam("i", "1", Number), 1) - 1,
      pageSize: 25,
    },
    sorting: [],
    ...defaults,
    globalFilter: getSearchParam("q", "", String),
  })

  createEffect((prevGlobalFilter?: string) => {
    if (prevGlobalFilter !== undefined && prevGlobalFilter !== tableState.globalFilter) {
      if (options?.useSearchParams) {
        const query = new URLSearchParams(location?.search)
        query.delete("q")
        query.delete("i")
        setSearchParam("q", "", query, tableState.globalFilter)

        navigate?.(`?${query}`, {
          scroll: false,
        })
      }

      setTableState(state => ({
        ...state,
        pagination: {
          pageIndex: 0,
          pageSize: state.pagination?.pageSize ?? 25,
        },
      }))
    }

    return tableState.globalFilter
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
