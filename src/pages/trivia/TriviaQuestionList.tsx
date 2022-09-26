import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
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
import { disableTriviaQuestions, verifyTriviaQuestions } from "./shared-graphql"

const TriviaQuestionListView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const location = useLocation()

  const [tableState, setTableState] = createTableState({
    sorting: [
      { id: "createdAt", desc: true },
    ],
  }, { useSearchParams: true })

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($args: TriviaQuestionListConnectionArgs) {
        triviaQuestionListConnection(args: $args) {
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
            createdAt
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
      args: {
        get offset() {
          return (tableState.pagination?.pageIndex ?? 0) * (tableState.pagination?.pageSize ?? 0)
        },
        get limit() {
          return tableState.pagination?.pageSize ?? 0
        },
        get orderBy() {
          const orderBy = tableState.sorting?.[0]
          if (!orderBy) {
            return undefined
          }

          return {
            col: orderBy.id,
            dir: orderBy.desc ? "DESC" : "ASC",
          }
        },
        get search() {
          return tableState.globalFilter
        },
        get verified() {
          return location.query.verified ? (location.query.verified === "true") : undefined
        },
        disabled: false,
      },
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const table = Table.createContext<TriviaQuestion>({
    get data() {
      return response.data?.triviaQuestionListConnection?.slice ?? []
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
        header: "Question",
      },
      {
        accessorKey: "answer",
        header: "Answer",
        maxSize: 100,
      },
      {
        accessorKey: "hint1",
        header: "Hints",
      },
      {
        accessorKey: "hint2",
        header: "",
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
      return response.data?.triviaQuestionListConnection?.pageCount
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

      <Section marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped toolbar={
          <Column.Row>
            <Show when={isTriviaAdmin()}>
              <Column>
                <Button color="success" action circle disabled={!selectedIds().length} onclick={handleVerify}>
                  <Icon src={iconCheck} />
                </Button>
              </Column>

              <Column>
                <Button color="failure" action circle disabled={!selectedIds().length} onclick={handleDisable}>
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
