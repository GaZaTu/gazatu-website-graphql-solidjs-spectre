import { validator } from "@felte/validator-superstruct"
import { iconCopy } from "@gazatu/solid-spectre/icons/iconCopy"
import { iconLogOut } from "@gazatu/solid-spectre/icons/iconLogOut"
import { iconSave } from "@gazatu/solid-spectre/icons/iconSave"
import { Autocomplete } from "@gazatu/solid-spectre/ui/Autocomplete"
import { Button } from "@gazatu/solid-spectre/ui/Button"
import { Column } from "@gazatu/solid-spectre/ui/Column"
import { Form } from "@gazatu/solid-spectre/ui/Form"
import { Icon } from "@gazatu/solid-spectre/ui/Icon"
import { Input } from "@gazatu/solid-spectre/ui/Input"
import { Navbar } from "@gazatu/solid-spectre/ui/Navbar"
import { createGlobalProgressStateEffect } from "@gazatu/solid-spectre/ui/Progress.Global"
import { Section } from "@gazatu/solid-spectre/ui/Section"
import { Toaster } from "@gazatu/solid-spectre/ui/Toaster"
import { Title } from "@solidjs/meta"
import { useLocation } from "@solidjs/router"
import { Component, createEffect, createMemo, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { array, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, UserInput } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck, storedAuth } from "../../store/auth"

const UserSchema = type({
  username: size(string(), 6, 32),
  roles: size(array(type({ name: string() })), 0, 5),
})

const UserView: Component = () => {
  const location = useLocation()

  const idParam = useIdFromParams()
  const id = createMemo(() => {
    return (location.pathname === "/profile") ? storedAuth()?.user?.id : idParam()
  })

  const isSelf = createMemo(() => id() === storedAuth()?.user?.id)

  const isAdmin = createAuthCheck("admin")

  const resource = createGraphQLResource<Query>({
    query: gql`
      query ($id: String!) {
        userById(id: $id) {
          id
          username
          createdAt
          roles {
            id
            name
          }
        }
        userRoleList {
          id
          name
        }
      }
    `,
    variables: {
      get id() {
        return id()
      },
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => resource.loading)

  const formSchema = UserSchema
  const form = Form.createContext<UserInput>({
    extend: [validator<any>({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async input => {
      await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: UserInput!) {
            userUpdate(input: $input)
          }
        `,
        variables: { input },
      })

      resource.refresh()
      return "Saved User"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(resource.data?.userById)
  })

  const loading = createMemo(() => {
    return resource.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || !isAdmin()
  })

  const roles = Autocomplete.createOptions(() => resource.data?.userRoleList ?? [], {
    filterable: true,
    createable: true,
    key: "name",
    disable: o => form.data("roles")?.map?.((v: any) => v.id)?.includes(o.id),
  })

  const handleCopyAuthToken = async () => {
    await navigator.clipboard.writeText(storedAuth()!.token!)
  }

  return (
    <>
      <Section size="xl" marginY>
        <Column.Row>
          <Column>
            <Title>{isSelf() ? "Profile" : "User"}</Title>
            <h3>{isSelf() ? "Profile" : "User"}</h3>
          </Column>

          <Show when={isSelf()}>
            <Column xxl="auto" offset="ml">
              <Button onclick={handleCopyAuthToken} color="gray">
                <Icon src={iconCopy} />
                <span>Auth-Token</span>
              </Button>
            </Column>

            <Column xxl="auto" offset="ml">
              <Button.A href="/logout" color="warning">
                <Icon src={iconLogOut} />
                <span>Logout</span>
              </Button.A>
            </Column>
          </Show>
        </Column.Row>
      </Section>

      <Section size="xl" marginY>
        <Form context={form} horizontal>
          <Form.Group label="Username">
            <Input type="text" name="username" readOnly ifEmpty={null} />
          </Form.Group>

          <Form.Group label="Roles">
            <Autocomplete name="roles" {...roles} multiple readOnly={readOnly()} />
          </Form.Group>

          <Form.Group>
            <Navbar size="lg">
              <Navbar.Section>
                <Button type="submit" color="primary" action onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                  <Icon src={iconSave} />
                </Button>
              </Navbar.Section>
            </Navbar>
          </Form.Group>
        </Form>
      </Section>
    </>
  )
}

export default UserView
