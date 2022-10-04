import { validator } from "@felte/validator-superstruct"
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
import Autocomplete from "../../ui/Autocomplete"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Form from "../../ui/Form"
import Icon from "../../ui/Icon"
import iconSave from "../../ui/icons/iconSave"
import Input from "../../ui/Input"
import Navbar from "../../ui/Navbar"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Toaster from "../../ui/Toaster"

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

  const response = createGraphQLResource<Query>({
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

  createGlobalProgressStateEffect(() => response.loading)

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

      response.refresh()
      return "Saved User"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(response.data?.userById)
  })

  const loading = createMemo(() => {
    return response.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || !isAdmin()
  })

  const roles = Autocomplete.createOptions(() => response.data?.userRoleList ?? [], {
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
              <Button onclick={handleCopyAuthToken} color="gray">Copy Auth-Token</Button>
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
                <Button type="submit" color="primary" action circle onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
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
