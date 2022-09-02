import { validator } from "@felte/validator-superstruct"
import { Component, createEffect } from "solid-js"
import { object, size, string } from "superstruct"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query } from "../../lib/schema.gql"
import useIdFromParams from "../../lib/useIdFromParams"
import Form from "../../ui/Form"
import FormGroup from "../../ui/Form.Group"
import Input from "../../ui/Input"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"

const TriviaCategoryValidator = object({
  name: size(string(), 1, 256),
  description: size(string(), 0, 256),
  submitter: size(string(), 0, 256),
})

const TriviaCategoryView: Component = () => {
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
      id,
      isNew: !id,
    },
  })

  createGlobalProgressStateEffect(() => category.loading)

  const form = Form.createContext({
    extend: [validator({ struct: TriviaCategoryValidator })],
  })

  createEffect(() => {
    form.setData(category.data?.triviaCategory)
  })

  return (
    <Section size="xl" marginTop>
      <h3>Trivia Category</h3>

      <Form context={form}>
        <FormGroup label="Name" horizontal>
          <Input type="text" name="name" />
        </FormGroup>

        <FormGroup label="Description" horizontal>
          <Input type="text" name="description" />
        </FormGroup>

        <FormGroup label="Submitter" horizontal>
          <Input type="text" name="submitter" />
        </FormGroup>
      </Form>
    </Section>
  )
}

export default TriviaCategoryView
