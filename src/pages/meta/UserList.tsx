import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo, For } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query, User, UserRole } from "../../lib/schema.gql"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Chip from "../../ui/Chip"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import iconDelete from "../../ui/icons/iconDelete"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Table from "../../ui/Table"
import { createTableState, tableColumnLink, tableColumnSelect, tableDateCell, tableOnGlobalFilterChange, tableOnPaginationChange, tableOnSortingChange } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"

const UserListView: Component = () => {
  const navigate = useNavigate()

  const isAdmin = createAuthCheck("admin")
  createEffect(() => {
    if (!isAdmin()) {
      navigate("/404")
    }
  })

  const response = createGraphQLResource<Query>({
    query: gql`
      query {
        userList {
          id
          username
          createdAt
          roles {
            id
            name
          }
        }
      }
    `,
    variables: {},
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const [tableState, setTableState] = createTableState({
    sorting: [
      { id: "createdAt", desc: true },
    ],
  }, { useSearchParams: true })

  const table = Table.createContext<User>({
    get data() {
      return response.data?.userList ?? []
    },
    columns: [
      tableColumnSelect(),
      tableColumnLink(row => ({ href: `/users/${row.original.id}` })),
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: info => (
          <For each={info.getValue() as UserRole[]}>
            {role => (
              <Chip>{role.name}</Chip>
            )}
          </For>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: tableDateCell(),
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

  const handleRemove = () => {
    // TODO
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Users</Title>
        <h3>Users</h3>
      </Section>

      <Section size="xl" marginY flex style={{ "flex-grow": 1 }}>
        <Table context={table} loading={response.loading} loadingSize="lg" striped pageQueryParam="p" toolbar={
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

export default UserListView
