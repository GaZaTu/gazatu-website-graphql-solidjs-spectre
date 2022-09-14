import { validator } from "@felte/validator-superstruct"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo } from "solid-js"
import { isServer } from "solid-js/web"
import { nullable, optional, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaQuestion } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck } from "../../store/auth"
import Autocomplete from "../../ui/Autocomplete"
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

const TriviaQuestionSchema = type({
  question: size(string(), 1, 512),
  answer: size(string(), 1, 256),
  category: type({ id: string() }),
})

const TriviaQuestionView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia-admin")

  const id = useIdFromParams()

  const response = createGraphQLResource<Query>({
    query: gql`
      query Query($id: ID!, $isNew: Boolean!, $isTriviaAdmin: Boolean!) {
        triviaQuestion(id: $id) @skip(if: $isNew) {
          id
          question
          answer
          category {
            id
            name
            verified
            disabled
          }
          language @skip(if: true) {
            id
            name
          }
          hint1
          hint2
          submitter
          verified
          disabled
          createdAt
          updatedAt
          reports @include(if: $isTriviaAdmin) {
            id
            message
            submitter
            createdAt
            updatedAt
          }
        }
        triviaCategories(disabled: false, verified: null) {
          id
          name
          verified
        }
        languages @skip(if: true) {
          id
          name
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
      get isTriviaAdmin() {
        return isTriviaAdmin()
      },
    },
  })

  createGlobalProgressStateEffect(() => response.loading)

  const navigate = useNavigate()

  const formSchema = TriviaQuestionSchema
  const form = Form.createContext({
    extend: [validator({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async _values => {
      const input = _values as Partial<TriviaQuestion>
      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation Mutation($input: TriviaQuestionInput!) {
            saveTriviaQuestion(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      })

      if (id()) {
        response.refresh()
        return "Saved Trivia Question"
      } else {
        navigate(`/trivia/question/${res.saveTriviaQuestion?.id}`)
        return "Submitted Trivia Question"
      }

    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(response.data?.triviaQuestion)
  })

  const loading = createMemo(() => {
    return response.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  const categories = Autocomplete.createOptions(() => response.data?.triviaCategories ?? [], {
    filterable: true,
    createable: false,
    key: "id",
  })

  return (
    <Section size="lg" withYMargin>
      <h3>Trivia Question</h3>

      <Form context={form} horizontal>
        <FormGroup label="Category">
          <Autocomplete name="category" {...categories} format={(i: any, t) => i.name} placeholder="test..." />
        </FormGroup>

        <FormGroup label="Question">
          <Input type="text" name="question" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Answer">
          <Input type="text" name="answer" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Hint 1">
          <Input type="text" name="hint1" readOnly={readOnly()} ifEmpty={null} />
        </FormGroup>

        <FormGroup label="Hint 2">
          <Input type="text" name="hint2" readOnly={readOnly()} ifEmpty={null} />
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
        <Switch checked={!!response.data?.triviaQuestion?.verified} oninput={undefined} disabled={readOnly() || !id()} style={{ color: response.data?.triviaQuestion?.verified ? "var(--success)" : "var(--failure)", "font-weight": "bold" }} />
      </FormGroup>
    </Section>
  )
}

export default TriviaQuestionView
