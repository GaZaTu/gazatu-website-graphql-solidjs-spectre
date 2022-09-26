import { validator } from "@felte/validator-superstruct"
import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { nullable, optional, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaCategoryInput } from "../../lib/schema.gql"
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
import ModalPortal from "../../ui/Modal.Portal"
import Navbar from "../../ui/Navbar"
import { createGlobalProgressStateEffect } from "../../ui/Progress.Global"
import Section from "../../ui/Section"
import Switch from "../../ui/Switch"
import Toaster from "../../ui/Toaster"
import { removeTriviaCategories, verifyTriviaCategories } from "./shared-graphql"

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
        triviaCategoryById(id: $id) @skip(if: $isNew) {
          id
          name
          description
          submitter
          verified
          disabled
          createdAt
          updatedAt
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
      const input = _values as TriviaCategoryInput
      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: TriviaCategoryInput!) {
            triviaCategorySave(input: $input) {
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
        navigate(`/trivia/categories/${res.triviaCategorySave?.id}`)
        return "Submitted Trivia Category"
      }
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(response.data?.triviaCategoryById)
  })

  const loading = createMemo(() => {
    return response.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  const verified = createMemo(() => {
    return response.data?.triviaCategoryById?.verified ?? false
  })

  const handleVerify = async () => {
    await Toaster.try(async () => {
      await verifyTriviaCategories([id()])
    })
  }

  const handleRemove = async () => {
    if (!await ModalPortal.confirm("Delete this trivia category?")) {
      return
    }

    await Toaster.try(async () => {
      await removeTriviaCategories([id()])
      navigate(-1)
    })
  }

  return (
    <Section size="lg" marginY>
      <Title>Trivia Category</Title>
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
              <Button type="submit" color="primary" action circle onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                <Icon src={iconSave} />
              </Button>
            </Navbar.Section>

            <Navbar.Section>
              <Show when={isTriviaAdmin()}>
                <Button color="failure" action circle onclick={handleRemove} disabled={readOnly() || !id()}>
                  <Icon src={iconDelete} />
                </Button>
              </Show>
            </Navbar.Section>
          </Navbar>
        </FormGroup>
      </Form>

      <FormGroup label="Verified" horizontal>
        <Switch checked={verified()} oninput={handleVerify} disabled={readOnly() || !id() || verified()} style={{ color: verified() ? "var(--success)" : "var(--failure)", "font-weight": "bold" }} />
      </FormGroup>
    </Section>
  )
}

export default TriviaCategoryView
