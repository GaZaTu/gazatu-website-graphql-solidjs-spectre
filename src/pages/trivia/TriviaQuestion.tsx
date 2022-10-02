import { validator } from "@felte/validator-superstruct"
import { createDebouncedMemo } from "@solid-primitives/memo"
import { createStorageSignal } from "@solid-primitives/storage"
import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo, For, lazy, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { array, nullable, optional, size, string, type } from "superstruct"
import fetchGraphQL, { createGraphQLResource, gql } from "../../lib/fetchGraphQL"
import { Mutation, Query, TriviaQuestionInput } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import useIdFromParams from "../../lib/useIdFromParams"
import { createAuthCheck } from "../../store/auth"
import Autocomplete from "../../ui/Autocomplete"
import Button from "../../ui/Button"
import Card from "../../ui/Card"
import Column from "../../ui/Column"
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
import { disableTriviaQuestions, verifyTriviaQuestions } from "./shared-graphql"

const TriviaQuestionSchema = type({
  categories: size(array(type({ id: string() })), 1, 5),
  question: size(string(), 1, 256),
  answer: size(string(), 1, 64),
  hint1: optional(nullable(size(string(), 0, 256))),
  hint2: optional(nullable(size(string(), 0, 256))),
  submitter: optional(nullable(size(string(), 0, 64))),
})

const TriviaQuestionView: Component = () => {
  const isTriviaAdmin = createAuthCheck("trivia/admin")

  const id = useIdFromParams()

  const response = createGraphQLResource<Query>({
    query: gql`
      query ($id: String!, $isNew: Boolean!) {
        triviaQuestionById(id: $id) @skip(if: $isNew) {
          id
          question
          answer
          categories {
            id
            name
            verified
            disabled
          }
          hint1
          hint2
          submitter
          verified
          disabled
          createdAt
          updatedAt
        }
        triviaCategoryList {
          id
          name
          verified
        }
      }
    `,
    variables: {
      get isTriviaAdmin() {
        return isTriviaAdmin()
      },
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

  const [submitMultiple, setSubmitMultiple] = createStorageSignal("trivia/submit-multiple", false, {
    serializer: (v: any) => JSON.stringify(v),
    deserializer: s => JSON.parse(s),
  })
  const toggleSubmitMultiple = () => {
    setSubmitMultiple(p => !p)
  }

  const formSchema = TriviaQuestionSchema
  const form = Form.createContext({
    extend: [validator({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async _values => {
      const input = _values as TriviaQuestionInput
      const res = await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: TriviaQuestionInput!) {
            triviaQuestionSave(input: $input) {
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
        if (submitMultiple()) {
          similarQuestionsResource.clear()
          form.reset()
        } else {
          navigate(`/trivia/questions/${res.triviaQuestionSave?.id}`)
        }

        return "Submitted Trivia Question"
      }
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  createEffect(() => {
    form.setData(response.data?.triviaQuestionById)
  })

  const loading = createMemo(() => {
    return response.loading || form.isSubmitting() || isServer
  })

  const readOnly = createMemo(() => {
    return loading() || (id() && !isTriviaAdmin())
  })

  const verified = createMemo(() => {
    return response.data?.triviaQuestionById?.verified ?? false
  })

  const similarQuestionsVariables = createDebouncedMemo(() => {
    if (id() && !form.touched("question")) {
      return undefined
    }

    const search = form.data("question")
    if (search?.length > 3) {
      return { search }
    }

    return undefined
  }, 1000)
  const similarQuestionsResource = createGraphQLResource<Query>({
    query: gql`
      query ($search: String) {
        triviaQuestionListConnection(args: { search: $search, limit: 4 }) {
          slice {
            id
            question
            answer
            categories {
              id
              name
              verified
              disabled
            }
            verified
            disabled
          }
        }
      }
    `,
    variables: similarQuestionsVariables,
    onError: Toaster.pushError,
  })
  const similarQuestions = createMemo(() => {
    return similarQuestionsResource.data?.triviaQuestionListConnection?.slice
      ?.filter(q => q.id !== id())
  })

  const categories = Autocomplete.createOptions(() => response.data?.triviaCategoryList ?? [], {
    filterable: true,
    createable: false,
    key: "name",
    disable: o => form.data("categories")?.map?.((v: any) => v.id)?.includes(o.id),
  })

  const handleVerify = async () => {
    await Toaster.try(async () => {
      await verifyTriviaQuestions([id()])
    })
  }

  const handleDisable = async () => {
    if (!await ModalPortal.confirm("Delete this trivia question?")) {
      return
    }

    await Toaster.try(async () => {
      await disableTriviaQuestions([id()])
      navigate(-1)
    })
  }

  return (
    <>
      <Section size="xl" marginY>
        <Title>Trivia Question</Title>
        <h3>Trivia Question</h3>

        <Column.Row>
          <Column>
            <Form context={form} horizontal>
              <FormGroup label="Categories" hint={(form.touched("categories") && !form.data("categories")?.length) ? "pick `General Knowledge` if this question does not have a category" : undefined}>
                <Autocomplete name="categories" {...categories} multiple readOnly={readOnly()} />
              </FormGroup>

              <FormGroup label="Question">
                <Input type="text" name="question" readOnly={readOnly()} ifEmpty={null} multiline style={{ "min-height": "calc(var(--control-height-md) * 3)" }} />
              </FormGroup>

              <FormGroup label="Answer">
                <Input type="text" name="answer" readOnly={readOnly()} ifEmpty={null} />
              </FormGroup>

              <FormGroup label="Hint 1">
                <Input type="text" name="hint1" readOnly={readOnly()} ifEmpty={null} multiline style={{ "min-height": "calc(var(--control-height-md) * 2)" }} />
              </FormGroup>

              <FormGroup label="Hint 2">
                <Input type="text" name="hint2" readOnly={readOnly()} ifEmpty={null} multiline style={{ "min-height": "calc(var(--control-height-md) * 2)" }} />
              </FormGroup>

              <FormGroup label="Submitter">
                <Input type="text" name="submitter" readOnly={readOnly()} ifEmpty={null} />
              </FormGroup>

              <FormGroup>
                <Navbar size="lg">
                  <Navbar.Section>
                    <Column.Row>
                      <Column>
                        <Button type="submit" color="primary" action circle onclick={form.createSubmitHandler()} disabled={readOnly()} loading={loading()}>
                          <Icon src={iconSave} />
                        </Button>
                      </Column>

                      <Column>
                        <Show when={!id()}>
                          <Switch checked={!!submitMultiple()} oninput={toggleSubmitMultiple}>
                            Batch
                          </Switch>
                        </Show>
                      </Column>
                    </Column.Row>
                  </Navbar.Section>

                  <Navbar.Section>
                    <Show when={isTriviaAdmin()}>
                      <Button color="failure" action circle onclick={handleDisable} disabled={readOnly() || !id()}>
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
          </Column>

          <Column xxl={4} sm={12}>
            <Show when={similarQuestions()?.length && !readOnly()}>
              <h5>Similar (<b>existing</b>) Questions:</h5>

              <Column.Row>
                <For each={similarQuestions()}>
                  {similarQuestion => (
                    <Column xxl={12} style={{ padding: "var(--unit-2)" }}>
                      <Card style={{ background: "rgba(var(--warning--rgb-triplet), 0.05)" }}>
                        <Card.Body>
                          <span>{similarQuestion.question}</span>
                        </Card.Body>
                      </Card>
                    </Column>
                  )}
                </For>
              </Column.Row>
            </Show>
          </Column>
        </Column.Row>
      </Section>

      <Show when={id() && isTriviaAdmin()}>
        <TriviaReportList questionId={id()} />
      </Show>
    </>
  )
}

export default TriviaQuestionView

const TriviaReportList = lazy(() => import("./TriviaReportList"))
