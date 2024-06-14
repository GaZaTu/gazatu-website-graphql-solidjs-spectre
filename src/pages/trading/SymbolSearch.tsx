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
import { Component, ComponentProps, createEffect, For } from "solid-js"

type TradingFilter = {
  id: string
  name: string
  active: boolean
}

type TradingSymbol = {
  isin?: string
  symbol?: string
  name?: string
  logo?: string
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
            <Tile.Icon>
              <Figure>
                <Img src={props.row.original.logo} />
              </Figure>
            </Tile.Icon>
            <Tile.Body>
              <Tile.Title>{props.row.original.name ?? props.row.original.symbol}</Tile.Title>
              <Tile.Subtitle>{props.row.original.isin}</Tile.Subtitle>
            </Tile.Body>
          </Tile>
        ),
        enableSorting: false,
      },
      // {
      //   accessorKey: "symbol",
      //   header: "SYMBOL",
      //   meta: { compact: true },
      //   maxSize: 100,
      //   enableSorting: false,
      // },
      // {
      //   accessorKey: "description",
      //   header: "DESCRIPTION",
      //   enableSorting: false,
      // },
      // {
      //   accessorKey: "type",
      //   header: "TYPE",
      //   meta: { compact: true },
      //   maxSize: 100,
      //   enableSorting: false,
      // },
    ],
    state: tableState,
    onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
    manualFiltering: true,
  })

  createEffect(() => {
    props.onSearchChange?.(tableState.globalFilter)
  })

  return (
    <div {...props}>
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
