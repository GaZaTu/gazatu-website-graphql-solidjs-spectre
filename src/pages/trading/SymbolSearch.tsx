// css
import "./SymbolSearch.css"
// js
import { A } from "@gazatu/solid-spectre/ui/A"
import { Column } from "@gazatu/solid-spectre/ui/Column"
import { Figure } from "@gazatu/solid-spectre/ui/Figure"
import { Img } from "@gazatu/solid-spectre/ui/Img"
import { Label } from "@gazatu/solid-spectre/ui/Label"
import { Table } from "@gazatu/solid-spectre/ui/Table"
import { createTableState, tableOnGlobalFilterChange } from "@gazatu/solid-spectre/ui/Table.Helpers"
import { Tile } from "@gazatu/solid-spectre/ui/Tile"
import { centerChildren } from "@gazatu/solid-spectre/util/position"
import { Component, ComponentProps, For, Show, createEffect, createSignal } from "solid-js"

type TradingFilter = {
  id: string
  name: string
  active: boolean
}

type TradingSymbol = {
  isin?: string
  symbol?: string
  name?: string
  logo?: string | URL
}

type Props = ComponentProps<"div"> & {
  search?: string
  onSearchChange?: (search: string) => unknown
  filters?: TradingFilter[]
  onFilterChange?: (filter: TradingFilter) => unknown
  loading?: boolean
  symbols?: TradingSymbol[]
  onSymbolClick?: (symbol: TradingSymbol) => unknown
}

const SymbolSearch: Component<Props> = props => {
  const [tableState, setTableState] = createTableState({})

  const table = Table.createContext({
    get data() {
      return props.symbols
    },
    columns: [
      {
        accessorKey: "__security",
        header: "Security",
        cell: (props) => (
          <Tile compact>
            <Show when={props.row.original.logo}>
              <Tile.Icon>
                <Figure>
                  <Img src={String(props.row.original.logo)} />
                </Figure>
              </Tile.Icon>
            </Show>
            <Tile.Body>
              <Tile.Title>
                <Column.Row>
                  <Column xxl={2}>{props.row.original.symbol}</Column>
                  <Column>{props.row.original.name}</Column>
                </Column.Row>
              </Tile.Title>
              <Tile.Subtitle>
                <Column.Row>
                  <Column xxl={2} />
                  <Column>{props.row.original.isin}</Column>
                </Column.Row>
              </Tile.Subtitle>
            </Tile.Body>
          </Tile>
        ),
        enableSorting: false,
      },
    ],
    state: tableState,
    onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
    manualFiltering: true,
  })

  createEffect(() => {
    props.onSearchChange?.(tableState.globalFilter)
  })

  const [containerRef, setContainerRef] = createSignal<HTMLElement>()
  createEffect(() => {
    containerRef()?.querySelector("input")?.focus()
  })

  return (
    <div ref={setContainerRef} {...props}>
      <Table context={table} loading={props.loading} loadingSize="sm" striped hidePagination onclickRow={row => props.onSymbolClick?.(row.original)} toolbar={
        <Column.Row class={`${centerChildren(true)}`} style={{ height: "100%" }} gaps="sm">
          <For each={props.filters}>
            {filter => (
              <Column>
                <A onclick={() => props.onFilterChange?.(filter)}>
                  <Label round color={filter.active ? "primary" : undefined}>{filter.name}</Label>
                </A>
              </Column>
            )}
          </For>
        </Column.Row>
      } />
    </div>
  )
}

export default SymbolSearch
