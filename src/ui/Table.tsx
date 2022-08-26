import { flexRender, Table as TableContext } from "@tanstack/solid-table"
import classnames from "classnames"
import { ComponentProps, For, Show, splitProps } from "solid-js"
import Navbar from "./Navbar"
import TableRow from "./Table.Row"
import "./Table.scss"

type Props = {
  context?: TableContext<unknown>
  striped?: boolean
  hoverable?: boolean
  scrollable?: boolean
  filterable?: boolean
}

const createTableClassName = (props: Props) => {
  return classnames({
    "table": true,
    "table-striped": props.striped,
    "table-hover": props.hoverable,
    "table-scroll": props.scrollable,
  })
}

function Table(props: Props & ComponentProps<"div">) {
  const [tableProps, __, containerProps] = splitProps(props, [
    "striped",
    "hoverable",
    "scrollable",
    "filterable",
  ], [
    "context",
  ])

  return (
    <div class="table-container" {...containerProps}>
      <Navbar class="table-toolbar">
        <Navbar.Section>
          <Show when={tableProps.filterable}>

          </Show>
        </Navbar.Section>

        <Navbar.Section>

        </Navbar.Section>
      </Navbar>

      <table class={createTableClassName(tableProps)}>
        <thead>
          <For each={__.context?.getHeaderGroups()}>
            {headerGroup => (
              <tr>
                <For each={headerGroup.headers}>
                  {header => (
                    <th colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder} fallback={null}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>

        <tbody>
          <For each={__.context?.getRowModel().rows}>
            {row => (
              <tr>
                <For each={row.getVisibleCells()}>
                  {cell => (
                    <td>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>

        <tfoot>
          <For each={__.context?.getFooterGroups()}>
            {footerGroup => (
              <tr>
                <For each={footerGroup.headers}>
                  {header => (
                    <th colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder} fallback={null}>
                        {flexRender(header.column.columnDef.footer, header.getContext())}
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tfoot>

        {containerProps.children}
      </table>
    </div>
  )
}

export default Object.assign(Table, {
  Row: TableRow,
})
