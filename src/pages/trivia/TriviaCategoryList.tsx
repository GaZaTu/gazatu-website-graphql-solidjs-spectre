import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
import { Component, createEffect, createMemo, Show } from "solid-js"
import iconCheck from "../../icons/iconCheck"
import iconTrash2 from "../../icons/iconTrash2"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, TriviaCategory } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import A from "../../ui/A"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import ModalPortal from "../../ui/Modal.Portal"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Table from "../../ui/Table"
import { createTableState, tableColumnLink, tableColumnSelect, tableDateCell, tableOnGlobalFilterChange, tableOnPaginationChange, tableOnSortingChange } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import { centerSelf } from "../../ui/util/position"
import { removeTriviaCategories, verifyTriviaCategories } from "./shared-graphql"

const TriviaCategoryListView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const location = useLocation()

  const resource = createGraphQLResource<Query>({
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

  createGlobalProgressStateEffect(() => resource.loading)

  createEffect(() => {
    if (!resource.data) {
      return
    }

    A.scrollHistory.restore()
  })

  const [tableState, setTableState] = createTableState({
    sorting: [
      { id: "name", desc: false },
    ],
  }, { useSearchParams: true })

  const table = Table.createContext<TriviaCategory>({
    get data() {
      return resource.data?.triviaCategoryList ?? []
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
        enableGlobalFilter: false,
      },
      {
        accessorKey: "questionsCount",
        header: "Questions",
        cell: info => info.getValue() ?? "N/A",
        maxSize: 100,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "verified",
        header: "Verified",
        meta: { compact: true },
        cell: info => (
          <Icon src={info.getValue() ? iconCheck : undefined} style={{ color: "var(--success)" }} class={`${centerSelf(true)}`} />
        ),
        maxSize: 100,
        enableGlobalFilter: false,
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
      resource.refresh()
    })
  }

  const handleRemove = async () => {
    if (!await ModalPortal.confirm("Delete the selected trivia categories?")) {
      return
    }

    await Toaster.try(async () => {
      await removeTriviaCategories(selectedIds())
      table.actions.setRowSelection({})
      resource.refresh()
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Categories</Title>
        <h3>Trivia Categories</h3>
      </Section>

      <Section size="xl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={resource.loading} loadingSize="lg" striped pageQueryParam="i" toolbar={
          <Column.Row>
            <Show when={isTriviaAdmin()}>
              <Column>
                <Button color="success" action circle disabled={!selectedIds().length} onclick={handleVerify}>
                  <Icon src={iconCheck} />
                </Button>
              </Column>

              <Column>
                <Button color="failure" action circle disabled={!selectedIds().length} onclick={handleRemove}>
                  <Icon src={iconTrash2} />
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
