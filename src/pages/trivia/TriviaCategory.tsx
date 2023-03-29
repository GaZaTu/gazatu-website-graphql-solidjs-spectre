import { validator } from "@felte/validator-superstruct"
import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo, lazy, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { nullable, optional, size, string, type } from "superstruct"
import iconSave from "../../icons/iconSave"
import iconTrash2 from "../../icons/iconTrash2"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaCategoryInput } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck } from "../../store/auth"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Form from "../../ui/Form"
import Icon from "../../ui/Icon"
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

  const resource = createGraphQLResource<Query>({
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

  createGlobalProgressStateEffect(() => resource.loading)

  const navigate = useNavigate()

  const formSchema = TriviaCategorySchema
  const form = Form.createContext<TriviaCategoryInput>({
    extend: [validator<any>({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async input => {
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
        resource.refresh()
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
    form.setData(resource.data?.triviaCategoryById)
  })

  const loading = createMemo(() => {
    return resource.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  const verified = createMemo(() => {
    return resource.data?.triviaCategoryById?.verified ?? false
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
    <>
      <Section size="xl" marginY>
        <Title>Trivia Category</Title>
        <h3>Trivia Category</h3>

        <Column.Row>
          <Column>
            <Form context={form} horizontal>
              <Form.Group label="Name">
                <Input type="text" name="name" readOnly={readOnly()} ifEmpty={null} />
              </Form.Group>

              <Form.Group label="Description">
                <Input type="text" name="description" readOnly={readOnly()} ifEmpty={null} />
              </Form.Group>

              <Form.Group label="Submitter">
                <Input type="text" name="submitter" readOnly={readOnly()} ifEmpty={null} />
              </Form.Group>

              <Form.Group>
                <Navbar size="lg">
                  <Navbar.Section>
                    <Button type="submit" color="primary" action circle onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                      <Icon src={iconSave} />
                    </Button>
                  </Navbar.Section>

                  <Navbar.Section>
                    <Show when={isTriviaAdmin()}>
                      <Button color="failure" action circle onclick={handleRemove} disabled={readOnly() || !id()}>
                        <Icon src={iconTrash2} />
                      </Button>
                    </Show>
                  </Navbar.Section>
                </Navbar>
              </Form.Group>
            </Form>

            <Form.Group horizontal>
              <Switch checked={verified()} oninput={handleVerify} disabled={readOnly() || !id() || verified()} style={{ color: verified() ? "var(--success)" : "var(--failure)", "font-weight": "bold" }}>
                <span>Verified</span>
              </Switch>
            </Form.Group>
          </Column>

          <Column xxl={4} sm={12} />
        </Column.Row>
      </Section>

      <Show when={id()}>
        <TriviaQuestionList categoryId={id()} />
      </Show>
    </>
  )
}

export default TriviaCategoryView

const TriviaQuestionList = lazy(() => import("./TriviaQuestionList"))
