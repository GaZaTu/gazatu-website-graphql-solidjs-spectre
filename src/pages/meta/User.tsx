import { validator } from "@felte/validator-superstruct"
import { gql } from "@solid-primitives/graphql"
import { useLocation, useNavigate } from "@solidjs/router"
import { Component, createMemo, Show, createEffect } from "solid-js"
import { isServer } from "solid-js/web"
import { array, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource } from "../../lib/fetchGraphQL"
import { Mutation, Query, User } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck, setStoredAuth, storedAuth } from "../../store/auth"
import Autocomplete from "../../ui/Autocomplete"
import Button from "../../ui/Button"
import Form from "../../ui/Form"
import FormGroup from "../../ui/Form.Group"
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

  const navigate = useNavigate()

  const logout = () => {
    setStoredAuth(null)
    navigate("/")
  }

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
  const form = Form.createContext({
    extend: [validator({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async _values => {
      const input = _values as Partial<User>
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disable: o => form.data("roles")?.map?.((v: any) => v.id)?.includes(o.id),
  })

  return (
    <Section size="xl" marginY>
      <Show when={isSelf()}>
        <Button color="warning" onclick={logout}>Logout</Button>
      </Show>

      <Form context={form} horizontal>
        <FormGroup label="Username">
          <Input type="text" name="username" readOnly ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Roles">
          <Autocomplete name="roles" {...roles} multiple readOnly={readOnly()} />
        </FormGroup>

        <FormGroup>
          <Navbar size="lg">
            <Navbar.Section>
              <Button type="submit" color="primary" action rounded onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                <Icon src={iconSave} />
              </Button>
            </Navbar.Section>
          </Navbar>
        </FormGroup>
      </Form>
    </Section>
  )
}

export default UserView
