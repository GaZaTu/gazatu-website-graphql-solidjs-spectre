import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
import { Component, createMemo, Show } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, TriviaCategory } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import iconCheck from "../../ui/icons/iconCheck"
import iconDelete from "../../ui/icons/iconDelete"
import ModalPortal from "../../ui/Modal.Portal"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Table from "../../ui/Table"
import { createTableState, tableColumnLink, tableColumnSelect, tableDateCell, tableOnGlobalFilterChange, tableOnPaginationChange, tableOnSortingChange } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import { centerSelf } from "../../ui/util/position"
import { removeTriviaCategories, verifyTriviaCategories } from "./TriviaCategory"

const TriviaCategoryListView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const location = useLocation()

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($isTriviaAdmin: Boolean!, $args: TriviaCategoryListArgs) {
        triviaCategoryList(args: $args) {
          id
          name
          submitter
          verified
          createdAt
          questionsCount @include(if: $isTriviaAdmin)
        }
      }
    `,
    variables: {
      get isTriviaAdmin() {
        return isTriviaAdmin()
      },
      args: {
        get verified() {
          return location.query.verified ? (location.query.verified === "true") : undefined
        },
        disabled: false,
      },
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const [tableState, setTableState] = createTableState({
    sorting: [
      { id: "createdAt", desc: true },
    ],
  }, { useSearchParams: true })

  const table = Table.createContext<TriviaCategory>({
    get data() {
      return response.data?.triviaCategoryList ?? []
    },
    columns: [
      tableColumnSelect(),
      tableColumnLink(row => ({ href: `/trivia/categories/${row.original.id}` })),
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "submitter",
        header: "Submitter",
        maxSize: 100,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: tableDateCell(),
        maxSize: 100,
      },
      {
        accessorKey: "questionsCount",
        header: "Questions",
        cell: info => info.getValue() ?? "N/A",
        maxSize: 100,
      },
      {
        accessorKey: "verified",
        header: "Verified",
        meta: { compact: true },
        cell: info => (
          <Icon src={info.getValue() ? iconCheck : undefined} style={{ color: "var(--success)" }} classList={{ ...centerSelf(true) }} />
        ),
        maxSize: 100,
      },
    ],
    state: tableState,
    onPaginationChange: tableOnPaginationChange(setTableState),
    onSortingChange: tableOnSortingChange(setTableState),
    onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
  })

  const selectedIds = createMemo(() => {
    return table.actions.getSelectedRowModel().flatRows.map(r => r.original.id!)
  })

  const handleVerify = async () => {
    await Toaster.try(async () => {
      await verifyTriviaCategories(selectedIds())
      table.actions.setRowSelection({})
      response.refresh()
    })
  }

  const handleRemove = async () => {
    if (!await ModalPortal.confirm("Delete the selected trivia categories?")) {
      return
    }

    await Toaster.try(async () => {
      await removeTriviaCategories(selectedIds())
      table.actions.setRowSelection({})
      response.refresh()
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Categories</Title>
        <h3>Trivia Categories</h3>
      </Section>

      <Section size="xl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped pageQueryParam="p" toolbar={
          <Column.Row>
            <Show when={isTriviaAdmin()}>
              <Column>
                <Button color="success" action rounded disabled={!selectedIds().length} onclick={handleVerify}>
                  <Icon src={iconCheck} />
                </Button>
              </Column>

              <Column>
                <Button color="failure" action rounded disabled={!selectedIds().length} onclick={handleRemove}>
                  <Icon src={iconDelete} />
                </Button>
              </Column>
            </Show>
          </Column.Row>
        } />
      </Section>
    </>
  )
}

export default TriviaCategoryListView
