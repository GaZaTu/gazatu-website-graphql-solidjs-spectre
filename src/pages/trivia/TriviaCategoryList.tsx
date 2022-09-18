import { Title } from "@solidjs/meta"
import { Component, Show } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, TriviaCategory } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import iconCheck from "../../ui/icons/iconCheck"
import iconDelete from "../../ui/icons/iconDelete"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Table from "../../ui/Table"
import { createTableState, tableColumnLink, tableColumnSelect, tableDateCell, tableOnGlobalFilterChange, tableOnPaginationChange, tableOnSortingChange } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import { centerSelf } from "../../ui/util/position"

const TriviaCategoryListView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($isTriviaAdmin: Boolean!, $verified: Boolean, $disabled: Boolean) {
        triviaCategories(verified: $verified, disabled: $disabled) {
          id
          name
          submitter
          verified
          disabled
          createdAt
          updatedAt
          questionsCount @include(if: $isTriviaAdmin)
        }
      }
    `,
    variables: {
      get isTriviaAdmin() {
        return isTriviaAdmin()
      },
      verified: undefined,
      disabled: false,
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const [tableState, setTableState] = createTableState({ useSearchParams: true })

  const table = Table.createContext<TriviaCategory>({
    get data() {
      return response.data?.triviaCategories ?? []
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
  })

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Categories</Title>
        <h3>Trivia Categories</h3>
      </Section>

      <Section size="xxl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped pageQueryParam="p" toolbar={
          <Column.Row>
            <Show when={isTriviaAdmin()}>
              <Column>
                <Button color="success" action rounded disabled={!table.actions.getIsSomeRowsSelected()}>
                  <Icon src={iconCheck} />
                </Button>
              </Column>

              <Column>
                <Button color="failure" action rounded disabled={!table.actions.getIsSomeRowsSelected()}>
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
