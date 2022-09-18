import { createDebouncedMemo } from "@solid-primitives/memo"
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, RowData, Table as TableActions, TableOptions, TableState as _TableState } from "@tanstack/solid-table"
import classnames from "classnames"
import { ComponentProps, createEffect, createSignal, For, JSX, mergeProps, Show, splitProps } from "solid-js"
import Column from "./Column"
import iconSearch from "./icons/iconSearch"
import Input from "./Input"
import LoadingPlaceholder from "./LoadingPlaceholder"
import Pagination from "./Pagination"
import TableRow from "./Table.Row"
import "./Table.scss"
import { loading } from "./util/loading"
import { marginT } from "./util/position"
import { rounded } from "./util/shapes"

declare module "@tanstack/solid-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    compact?: boolean
  }
}

export type TableState = _TableState

type TableContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: createSolidTable<TData>(options as any),
  }
}

const getColumnStyle = (columnDef?: ColumnDef<unknown, unknown>, clickable = false): JSX.CSSProperties => ({
  "width": columnDef?.meta?.compact ? "1%" : (columnDef?.size ? `${columnDef?.size}px` : undefined),
  "min-width": columnDef?.minSize ? `${columnDef?.minSize}px` : undefined,
  "max-width": columnDef?.maxSize ? `${columnDef?.maxSize}px` : undefined,

  "cursor": clickable ? "pointer" : undefined,
  "user-select": clickable ? "none" : undefined,
})

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: TableContext
  striped?: boolean
  hoverable?: boolean
  scrollable?: boolean
  filterable?: boolean
  loading?: boolean
  loadingSize?: "sm" | "lg"
  toolbar?: JSX.Element
  pageQueryParam?: string
}

const createTableClassName = (props: Props) => {
  return classnames({
    "table": true,
    "table-striped": props.striped,
    "table-hover": props.hoverable,
    "table-scroll": props.scrollable,
    "table-loading": props.loading,
  })
}

function Table(props: Props & ComponentProps<"div">) {
  const [tableProps, __, containerProps] = splitProps(props, [
    "striped",
    "hoverable",
    "scrollable",
    "filterable",
    "loading",
    "loadingSize",
    "toolbar",
    "pageQueryParam",
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
    <div class="table-container" {...containerProps}>
      <Column.Row class="table-toolbar">
        <Column xxl={4} md={6} sm={12} classList={{ ...marginT(2) }}>
          <Input value={__.context?.actions.getState().globalFilter ?? ""} oninput={ev => setGlobalFilter(ev.currentTarget.value)} iconSrcLeft={iconSearch} classList={{ ...rounded("lg") }} placeholder="Search..." />
        </Column>

        <Column xxl="auto" offset="ml" classList={{ ...marginT(2) }}>
          {tableProps.toolbar}
        </Column>
      </Column.Row>

      <div class="table-scroll-container">
        <table class={createTableClassName(tableProps)}>
          <thead>
            <For each={__.context?.actions.getHeaderGroups()}>
              {headerGroup => (
                <tr>
                  <For each={headerGroup.headers}>
                    {header => (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <th colSpan={header.colSpan} onclick={header.column.getToggleSortingHandler()} style={getColumnStyle(header.column.columnDef as any, header.column.getCanSort())}>
                        <Show when={!header.isPlaceholder} fallback={null}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? undefined}
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
                  <tr><td colSpan={99}><div classList={{ ...loading("lg") }} /></td></tr>
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
                <TableRow>
                  <For each={row.getVisibleCells()}>
                    {cell => (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <td style={getColumnStyle(cell.column.columnDef as any)}>
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

      <Column.Row class="table-pagination" style={{ background: "var(--body-bg)", position: "sticky", bottom: 0 }}>
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
    </div>
  )
}

export default Object.assign(Table, {
  createContext,
  Row: TableRow,
})

type PlaceholderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions?: TableActions<any>
}

const PlaceholderRow = (props: PlaceholderRowProps) => {
  return (
    <tr>
      <For each={props.actions?.getVisibleFlatColumns()}>
        {column => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <td style={getColumnStyle(column.columnDef as any)}>
            <LoadingPlaceholder width="100%" height="var(--line-height)" />
          </td>
        )}
      </For>
    </tr>
  )
}
