import { validator } from "@felte/validator-superstruct"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo } from "solid-js"
import { isServer } from "solid-js/web"
import { nullable, optional, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaCategory } from "../../lib/schema.gql"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck } from "../../store/auth"
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

const TriviaCategoryValidator = type({
  name: size(string(), 1, 256),
  description: optional(nullable(size(string(), 0, 256))),
  submitter: optional(nullable(size(string(), 0, 256))),
})

const TriviaCategoryView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia-admin")

  const id = useIdFromParams()

  const category = createGraphQLResource<Query>({
    query: gql`
      query Query($id: ID!, $isNew: Boolean!) {
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
  })

  createGlobalProgressStateEffect(() => category.loading)

  const navigate = useNavigate()

  const form = Form.createContext({
    extend: [validator({ struct: TriviaCategoryValidator })],
    onSubmit: async _values => {
      const input = _values as Partial<TriviaCategory>
      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation Mutation($input: TriviaCategoryInput!) {
            saveTriviaCategory(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      })

      if (id()) {
        category.refresh()
      } else {
        navigate(`/trivia/categories/${res.saveTriviaCategory?.id}`)
      }

      return "Submitted Trivia Category"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(category.data?.triviaCategory)
  })

  const loading = createMemo(() => {
    return category.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  return (
    <Section size="xl" marginTop>
      <h3>Trivia Category</h3>

      <Form context={form}>
        <Navbar size="lg">
          <Navbar.Section style={{ "max-width": 0 }} />
          <Navbar.Section>
            <Button type="submit" color="primary" action rounded onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
              <Icon src={iconSave} />
            </Button>
          </Navbar.Section>
        </Navbar>

        <FormGroup label="Name" horizontal>
          <Input type="text" name="name" readOnly={readOnly()} />
        </FormGroup>

        <FormGroup label="Description" horizontal>
          <Input type="text" name="description" readOnly={readOnly()} />
        </FormGroup>

        <FormGroup label="Submitter" horizontal>
          <Input type="text" name="submitter" readOnly={readOnly()} />
        </FormGroup>
      </Form>
    </Section>
  )
}

export default TriviaCategoryView
