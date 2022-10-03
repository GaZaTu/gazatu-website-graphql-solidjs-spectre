import { validator } from "@felte/validator-superstruct"
import { Component } from "solid-js"
import { size, string, type } from "superstruct"
import fetchGraphQL, { gql } from "../../lib/fetchGraphQL"
import { Mutation, TriviaQuestionInput, TriviaReportInput } from "../../lib/schema.gql"
import superstructIsRequired from "../../lib/superstructIsRequired"
import Button from "../../ui/Button"
import Form from "../../ui/Form"
import Input from "../../ui/Input"
import Modal from "../../ui/Modal"
import { ModalProps } from "../../ui/Modal.Portal"
import Toaster from "../../ui/Toaster"

const TriviaReportSchema = type({
  message: size(string(), 1, 256),
  submitter: size(string(), 1, 128),
})

type Props = ModalProps & {
  question: TriviaQuestionInput
}

const TriviaReportModal: Component<Props> = modal => {
  const formSchema = TriviaReportSchema
  const form = Form.createContext<TriviaReportInput>({
    extend: [validator<any>({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async input => {
      await fetchGraphQL<Mutation>({
        query: gql`
          mutation ($input: TriviaReportInput!) {
            triviaReportSave(input: $input) {
              id
            }
          }
        `,
        variables: { input },
      })

      modal.resolve()
      return "Reported trivia question"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
    initialValues: {
      question: modal.question,
    },
  })

  return (
    <Modal onclose={modal.resolve} active>
      <Modal.Header>
        <h5>Report trivia question</h5>
      </Modal.Header>

      <Modal.Body>
        <Form context={form} horizontal>
          <Form.Group label="Message">
            <Input type="text" name="message" ifEmpty={null} multiline style={{ "min-height": "calc(var(--control-height-md) * 2)" }} />
          </Form.Group>

          <Form.Group label="Submitter">
            <Input type="text" name="submitter" ifEmpty={null} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button color="primary" onclick={form.createSubmitHandler()} loading={form.isSubmitting()}>OK</Button>
        <Button color="link" onclick={modal.resolve}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default TriviaReportModal
