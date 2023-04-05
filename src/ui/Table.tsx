import { createDebouncedMemo } from "@solid-primitives/memo"
import { createSolidTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, RowData, Table as TableActions, TableOptions, TableState as _TableState } from "@tanstack/solid-table"
import classnames from "classnames"
import { ComponentProps, createEffect, createSignal, For, JSX, mergeProps, Show, splitProps } from "solid-js"
import Column from "./Column"
import Icon from "./Icon"
import Input from "./Input"
import LoadingPlaceholder from "./LoadingPlaceholder"
import Pagination from "./Pagination"
import TableRow from "./Table.Row"
import "./Table.scss"
import { loading } from "./util/loading"
import { marginY } from "./util/position"

declare module "@tanstack/solid-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    compact?: boolean
  }
}

export type TableState = _TableState

type TableContext = {
  options: any
  actions: TableActions<any>
}

function createContext<TData extends RowData>(options: Partial<TableOptions<TData>>) {
  options = mergeProps({
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
    },
  } as TableOptions<TData>, options)

  return {
    options,
    actions: createSolidTable<TData>(options as any),
  }
}

type Props = {
  context?: TableContext
  striped?: boolean
  scrollable?: boolean
  filterable?: boolean
  sticky?: boolean
  loading?: boolean
  loadingSize?: "sm" | "lg"
  toolbar?: JSX.Element
  pageQueryParam?: string
  hidePagination?: boolean
  onclickRow?: (row: Row<any>) => unknown
}

const createTableClassName = (props: Props) => {
  return classnames({
    "table": true,
    "table-striped": props.striped,
    "table-hover": !!props.onclickRow,
    "table-scroll": props.scrollable,
    "table-loading": props.loading,
  })
}

function Table(props: Props & ComponentProps<"div">) {
  const [tableProps, __, containerProps] = splitProps(props, [
    "striped",
    "scrollable",
    "filterable",
    "sticky",
    "loading",
    "loadingSize",
    "toolbar",
    "pageQueryParam",
    "hidePagination",
    "onclickRow",
  ], [
    "context",
  ])

  const getPageCount = () => {
    try {
      return __.context?.actions.getPageCount()
    } catch {
      return 1
    }
  }

  const [globalFilter, setGlobalFilter] = createSignal(__.context?.actions.getState().globalFilter ?? "")
  const globalFilterDebounced = createDebouncedMemo(() => globalFilter(), 500)
  createEffect(() => {
    __.context?.actions.setGlobalFilter(globalFilterDebounced())
  })

  return (
    <div class={`table-container ${tableProps.sticky ? "sticky" : ""}`} {...containerProps}>
      <Column.Row class="table-toolbar">
        <Column xxl={4} md={6} sm={12} class={`${marginY(2)}`}>
          <Input value={__.context?.actions.getState().globalFilter ?? ""} oninput={ev => setGlobalFilter(ev.currentTarget.value)} iconSrcLeft={Icon.Context.iconSearch} placeholder="Search..." />
        </Column>

        <Column xxl="auto" offset="ml" class={`${marginY(2)}`}>
          {tableProps.toolbar}
        </Column>
      </Column.Row>

      <div class="table-scroll-container">
        <table class={createTableClassName(tableProps)}>
          <colgroup>
            <Show when={__.context?.actions.getHeaderGroups()[0]} keyed>
              {headerGroup => (
                <For each={headerGroup.headers}>
                  {({ column: { columnDef }}) => (
                    <col style={{
                      "width": columnDef?.meta?.compact ? "1%" : (columnDef?.size ? `${columnDef?.size}px` : undefined),
                      "min-width": columnDef?.minSize ? `${columnDef?.minSize}px` : undefined,
                      "max-width": columnDef?.maxSize ? `${columnDef?.maxSize}px` : undefined,
                    }} />
                  )}
                </For>
              )}
            </Show>
          </colgroup>

          <thead>
            <For each={__.context?.actions.getHeaderGroups()}>
              {headerGroup => (
                <tr>
                  <For each={headerGroup.headers}>
                    {header => (
                      <th colSpan={header.colSpan} onclick={header.column.getToggleSortingHandler()} class={`${header.column.getCanSort() ? "th-clickable" : ""}`}>
                        <Show when={!header.isPlaceholder} fallback={null}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <Show when={header.column.getIsSorted() === "asc"}>
                            <Icon src={Icon.Context.iconArrowUp} />
                          </Show>
                          <Show when={header.column.getIsSorted() === "desc"}>
                            <Icon src={Icon.Context.iconArrowDown} />
                          </Show>
                        </Show>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>

          <tbody>
            <For each={__.context?.actions.getRowModel().rows} fallback={(
              <Show when={tableProps.loading} fallback={<tr><td colSpan={99}>Nothing here</td></tr>}>
                <Show when={tableProps.loadingSize === "lg"} fallback={
                  <tr><td colSpan={99}><div class={`${loading("lg")}`} /></td></tr>
                }>
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                  <PlaceholderRow actions={__.context?.actions} />
                </Show>
              </Show>
            )}>
              {row => (
                <TableRow onclick={() => tableProps.onclickRow?.(row)}>
                  <For each={row.getVisibleCells()}>
                    {cell => (
                      <td>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <Show when={!tableProps.hidePagination}>
        <Column.Row class="table-pagination">
          <Column xxl={8} md={6} sm={12} />

          <Column xxl={4} md={6} sm={12}>
            <Pagination
              pageIndex={__.context?.actions.getState().pagination.pageIndex}
              onPageIndexChange={page => __.context?.actions.setPageIndex(page)}
              pageCount={getPageCount()}
              // hasNext={__.context?.state.getCanNextPage() ?? false}
              // hasPrev={__.context?.state.getCanPreviousPage() ?? false}
              loading={tableProps.loading}
              pageQueryParam={tableProps.pageQueryParam}
              compact
            />
          </Column>
        </Column.Row>
      </Show>
    </div>
  )
}

export default Object.assign(Table, {
  createContext,
  Row: TableRow,
})

type PlaceholderRowProps = {
  actions?: TableActions<any>
}

const PlaceholderRow = (props: PlaceholderRowProps) => {
  return (
    <tr>
      <For each={props.actions?.getVisibleFlatColumns()}>
        {() => (
          <td>
            <LoadingPlaceholder width="100%" height="var(--line-height)" />
          </td>
        )}
      </For>
    </tr>
  )
}
