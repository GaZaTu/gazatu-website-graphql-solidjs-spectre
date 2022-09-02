import { Component } from "solid-js"
import { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Query } from "../../lib/schema.gql"
import useIdFromParams from "../../lib/useIdFromParams"
import Form from "../../ui/Form"
import FormGroup from "../../ui/Form.Group"
import Input from "../../ui/Input"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"

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

  return (
    <Section size="xl" marginTop>
      <h3>Trivia Category</h3>

      <Form>
        <FormGroup label="Name" horizontal>
          <Input type="text" name="name" id="c-name" />
        </FormGroup>
      </Form>
    </Section>
  )
}

export default TriviaCategoryView
