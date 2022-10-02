import { validator } from "@felte/validator-superstruct"
import { useNavigate } from "@solidjs/router"
import { Component, createMemo, Show } from "solid-js"
import { isServer } from "solid-js/web"
import { literal, refine, size, string, type } from "superstruct"
import fetchGraphQL, { gql } from "../lib/fetchGraphQL"
import { Mutation, Query } from "../lib/schema.gql"
import superstructIsRequired from "../lib/superstructIsRequired"
import { setStoredAuth } from "../store/auth"
import A from "../ui/A"
import Button from "../ui/Button"
import Checkbox from "../ui/Checkbox"
import Column from "../ui/Column"
import Divider from "../ui/Divider"
import Form from "../ui/Form"
import Input from "../ui/Input"
import Section from "../ui/Section"
import Toaster from "../ui/Toaster"
import { tooltip } from "../ui/util/tooltip"
import useBreakpoints from "../ui/util/useBreakpoints"

const AuthenticateSchema = type({
  username: size(string(), 6, 256),
  password: size(string(), 6, 256),
})

const RegisterUserSchema = refine(
  type({
    username: size(string(), 6, 256),
    password: size(string(), 6, 256),
    password2: string(),
    __check: literal(true),
  }),
  "passwords_must_be_equal",
  ({ password, password2 }) => {
    if (password === password2) {
      return true
    }

    return {
      path: ["password2"],
      message: "Passwords must be equal",
    }
  },
)

const gqlAuthenticate = gql`
  query ($username: String!, $password: String!) {
    userAuthenticate(username: $username, password: $password) {
      token
      user {
        id
        username
        roles {
          name
        }
      }
    }
  }
`

const gqlRegisterUser = gql`
  mutation ($username: String!, $password: String!) {
    userCreate(username: $username, password: $password) {
      token
      user {
        id
        username
        roles {
          name
        }
      }
    }
  }
`

const LoginForm: Component<{ isRegister?: boolean }> = props => {
  const navigate = useNavigate()

  const formSchema = props.isRegister ? RegisterUserSchema : AuthenticateSchema
  const form = Form.createContext<Record<string, unknown>>({
    extend: [validator<any>({ struct: formSchema })],
    isRequired: superstructIsRequired.bind(undefined, formSchema),
    onSubmit: async input => {
      const res = await fetchGraphQL<Mutation & Query>({
        query: props.isRegister ? gqlRegisterUser : gqlAuthenticate,
        variables: { ...input },
      })

      const auth = props.isRegister ? res.userCreate : res.userAuthenticate
      setStoredAuth(auth ?? null)

      navigate("/")

      return "Authenticated"
    },
    onSuccess: Toaster.pushSuccess,
    onError: Toaster.pushError,
  })

  const loading = createMemo(() => {
    return form.isSubmitting() || isServer
  })

  return (
    <Form context={form}>
      <h3>{props.isRegister ? "Register" : "Login"}</h3>

      <Form.Group label="Username">
        <Input type="text" name="username" />
      </Form.Group>

      <Form.Group label={(
        <span {...tooltip("sent over TLS1.3, hashed using argon2")}>Password {props.isRegister && (<A href="https://github.com/GaZaTu/gazatu-api-graphql-pgsql/blob/master/src/graphql/user/auth/auth.resolver.ts#L91" tabIndex={-1}>(Server)</A>)}</span>
      )} labelAsString="Password">
        <Input type="password" name="password" />
      </Form.Group>

      <Show when={props.isRegister}>
        <Form.Group label="Repeat Password">
          <Input type="password" name="password2" />
        </Form.Group>

        <Form.Group label="I agree to sacrifice my soul and firstborn to dankman overlord pajlada">
          <Checkbox name="__check" />
        </Form.Group>
      </Show>

      <Form.Group>
        <Button type="submit" color="primary" onclick={form.createSubmitHandler()} loading={loading()}>
          {props.isRegister ? "Register" : "Login"}
        </Button>
      </Form.Group>
    </Form>
  )
}

const LoginView: Component = () => {
  const breakpoints = useBreakpoints()

  return (
    <Section size="xl" marginY>
      <Column.Row>
        <Column sm={12}>
          <LoginForm />
        </Column>

        <Divider label="OR" vertical={breakpoints.md} />

        <Column sm={12}>
          <LoginForm isRegister />
        </Column>
      </Column.Row>
    </Section>
  )
}

export default LoginView
