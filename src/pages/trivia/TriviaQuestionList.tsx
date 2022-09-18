import { Title } from "@solidjs/meta"
import { Component, createMemo, For, Show } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, TriviaCategory, TriviaQuestion } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import A from "../../ui/A"
import Button from "../../ui/Button"
import Chip from "../../ui/Chip"
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
import { disableTriviaQuestions, verifyTriviaQuestions } from "./TriviaQuestion"

const TriviaQuestionListView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const [tableState, setTableState] = createTableState({ useSearchParams: true })

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($isTriviaAdmin: Boolean!, $offset: Int, $limit: Int, $sortBy: String, $sortDir: SortDirection, $search: String, $verified: Boolean, $disabled: Boolean) {
        triviaQuestions(offset: $offset, limit: $limit, sortBy: $sortBy, sortDir: $sortDir, search: $search, verified: $verified, disabled: $disabled) {
          slice {
            id
            categories {
              id
              name
            }
            question
            answer
            hint1
            hint2
            submitter
            verified
            disabled
            createdAt
            updatedAt
          }
          pageIndex
          pageCount
        }
      }
    `,
    variables: {
      get isTriviaAdmin() {
        return isTriviaAdmin()
      },
      get offset() {
        return (tableState.pagination?.pageIndex ?? 0) * (tableState.pagination?.pageSize ?? 0)
      },
      get limit() {
        return tableState.pagination?.pageSize ?? 0
      },
      get sortBy() {
        return tableState.sorting?.[0]?.id
      },
      get sortDir() {
        return tableState.sorting?.[0]?.desc ? "DESC" : "ASC"
      },
      get search() {
        return tableState.globalFilter
      },
      verified: undefined,
      disabled: false,
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const table = Table.createContext<TriviaQuestion>({
    get data() {
      return response.data?.triviaQuestions?.slice ?? []
    },
    columns: [
      tableColumnSelect(),
      tableColumnLink(row => ({ href: `/trivia/questions/${row.original.id}` })),
      {
        accessorKey: "categories",
        header: "Categories",
        cell: info => (
          <For each={info.getValue() as TriviaCategory[]}>
            {category => (
              <A href={`/trivia/categories/${category.id}`} style={{ color: "unset" }}>
                <Chip>{category.name}</Chip>
              </A>
            )}
          </For>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "question",
        header: "Name",
      },
      {
        accessorKey: "submitter",
        header: "Submitter",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: tableDateCell(),
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
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    get pageCount() {
      return response.data?.triviaQuestions?.pageCount
    },
  })

  const selectedIds = createMemo(() => {
    return table.actions.getSelectedRowModel().flatRows.map(r => r.original.id!)
  })

  const handleVerify = async () => {
    await Toaster.try(async () => {
      await verifyTriviaQuestions(selectedIds())
      table.actions.setRowSelection({})
      response.refresh()
    })
  }

  const handleDisable = async () => {
    if (!await ModalPortal.confirm("Delete the selected trivia questions?")) {
      return
    }

    await Toaster.try(async () => {
      await disableTriviaQuestions(selectedIds())
      table.actions.setRowSelection({})
      response.refresh()
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Questions</Title>
        <h3>Trivia Questions</h3>
      </Section>

      <Section size="xxl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped toolbar={
          <Column.Row>
            <Show when={isTriviaAdmin()}>
              <Column>
                <Button color="success" action rounded disabled={!selectedIds().length} onclick={handleVerify}>
                  <Icon src={iconCheck} />
                </Button>
              </Column>

              <Column>
                <Button color="failure" action rounded disabled={!selectedIds().length} onclick={handleDisable}>
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

export default TriviaQuestionListView
