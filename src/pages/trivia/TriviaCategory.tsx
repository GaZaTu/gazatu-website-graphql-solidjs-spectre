import { validator } from "@felte/validator-superstruct"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo } from "solid-js"
import { isServer } from "solid-js/web"
import { nullable, optional, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaCategory } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Form from "../../ui/Form"
import FormGroup from "../../ui/Form.Group"
import Icon from "../../ui/Icon"
import iconDelete from "../../ui/icons/iconDelete"
import iconSave from "../../ui/icons/iconSave"
import Input from "../../ui/Input"
import Navbar from "../../ui/Navbar"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Switch from "../../ui/Switch"
import Toaster from "../../ui/Toaster"

const TriviaCategorySchema = type({
  name: size(string(), 1, 32),
  description: optional(nullable(size(string(), 0, 256))),
  submitter: optional(nullable(size(string(), 0, 64))),
})

const TriviaCategoryView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const id = useIdFromParams()

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($id: String!, $isNew: Boolean!) {
        triviaCategory(id: $id) @skip(if: $isNew) {
          id
          name
          description
          submitter
          verified
          disabled
          createdAt
          updatedAt
          questions @skip(if: true) {
            id
            question
            hint1
            hint2
            answer
            verified
          }
        }
      }
    `,
    variables: {
      get id() {
        return id()
      },
      get isNew() {
        return !id()
      },
    },
    onError: Toaster.pushError,
  })

  createGlobalProgressStateEffect(() => response.loading)

  const navigate = useNavigate()

  const formSchema = TriviaCategorySchema
  const form = Form.createContext({
    extend: [validator({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async _values => {
      const input = _values as Partial<TriviaCategory>
      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: TriviaCategoryInput!) {
            saveTriviaCategory(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      })

      if (id()) {
        response.refresh()
        return "Saved Trivia Category"
      } else {
        navigate(`/trivia/categories/${res.saveTriviaCategory?.id}`)
        return "Submitted Trivia Category"
      }
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(response.data?.triviaCategory)
  })

  const loading = createMemo(() => {
    return response.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  return (
    <Section size="lg" marginY>
      <h3>Trivia Category</h3>

      <Form context={form} horizontal>
        <FormGroup label="Name">
          <Input type="text" name="name" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Description">
          <Input type="text" name="description" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Submitter">
          <Input type="text" name="submitter" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup>
          <Navbar size="lg">
            <Navbar.Section>
              <Button type="submit" color="primary" action rounded onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                <Icon src={iconSave} />
              </Button>
            </Navbar.Section>

            <Navbar.Section>
              <Button color="failure" action rounded disabled={readOnly()}>
                <Icon src={iconDelete} />
              </Button>
            </Navbar.Section>
          </Navbar>
        </FormGroup>
      </Form>

      <FormGroup label="Verified" horizontal>
        <Switch checked={!!response.data?.triviaCategory?.verified} oninput={undefined} disabled={readOnly() || !id()} style={{ color: response.data?.triviaCategory?.verified ? "var(--success)" : "var(--failure)", "font-weight": "bold" }} />
      </FormGroup>
    </Section>
  )
}

export default TriviaCategoryView
