import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { ColumnDef } from "@tanstack/solid-table"
import { Component, createEffect, createMemo } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, TriviaReport } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import iconDelete from "../../ui/icons/iconDelete"
import ModalPortal from "../../ui/Modal.Portal"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Table from "../../ui/Table"
import { createTableState, tableColumnLink, tableColumnSelect, tableDateCell, tableOnGlobalFilterChange, tableOnPaginationChange, tableOnSortingChange } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import { removeTriviaReports } from "./shared-graphql"

const TriviaReportListView: Component<{ questionId?: unknown }> = props => {
  const navigate = useNavigate()

  const isTriviaAdmin = createAuthCheck("trivia/admin")
  createEffect(() => {
    if (!isTriviaAdmin()) {
      navigate("/404")
    }
  })

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($questionId: String) {
        triviaReportList(questionId: $questionId) {
          id
          message
          submitter
          createdAt
          question {
            id
            question
          }
        }
      }
    `,
    variables: {
      get questionId() {
        return props.questionId
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

  const table = Table.createContext<TriviaReport>({
    get data() {
      return response.data?.triviaReportList ?? []
    },
    get columns(): ColumnDef<TriviaReport, any>[] {
      return [
        tableColumnSelect(),
        tableColumnLink(row => ({ href: `/trivia/questions/${row.original.question?.id}` })),
        ...(!props.questionId ? [{
          accessorKey: "question.question",
          header: "Question",
        }] : []),
        {
          accessorKey: "message",
          header: "Message",
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
      ]
    },
    state: tableState,
    onPaginationChange: tableOnPaginationChange(setTableState),
    onSortingChange: tableOnSortingChange(setTableState),
    onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
  })

  const selectedIds = createMemo(() => {
    return table.actions.getSelectedRowModel().flatRows.map(r => r.original.id!)
  })

  const handleRemove = async () => {
    if (!await ModalPortal.confirm("Delete the selected trivia reports?")) {
      return
    }

    await Toaster.try(async () => {
      await removeTriviaReports(selectedIds())
      table.actions.setRowSelection({})
      response.refresh()
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Reports</Title>
        <h3>Trivia Reports</h3>
      </Section>

      <Section size="xl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped pageQueryParam="i" toolbar={
          <Column.Row>
            <Column>
              <Button color="failure" action circle disabled={!selectedIds().length} onclick={handleRemove}>
                <Icon src={iconDelete} />
              </Button>
            </Column>
          </Column.Row>
        } />
      </Section>
    </>
  )
}

export default TriviaReportListView
