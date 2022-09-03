import { createEffect, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { isServer } from "solid-js/web"
import fetchFromApi from "./fetchFromApi"

const [graphqlEndpoint, setGraphqlEndpoint] = createSignal<string>("")

export {
  graphqlEndpoint,
  setGraphqlEndpoint,
}

type GraphQLOptions = {
  query: string
  variables?: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphQLResult<T = any> = {
  errors?: { message?: string }[]
  data?: T
}

const fetchGraphQL = async<T>(options: GraphQLOptions) => {
  const response = await fetchFromApi(graphqlEndpoint(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: options.query,
      variables: options.variables,
    }),
  })

  const json = await response.json() as GraphQLResult<T>

  const errorMessage = json?.errors?.[0]?.message
  const error = errorMessage ? new Error(errorMessage) : undefined

  if (error) {
    throw error
  }

  return json.data!
}

export default fetchGraphQL

// const createGraphQLResource = createGraphQLClient(graphqlEndpoint, {}, fetchFromApi)

export const gql = (query: TemplateStringsArray) =>
  query
    .join(" ")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()

type GraphQLResourceOptions<T, I extends T = T> = GraphQLOptions & {
  initialValue?: I
}

const createGraphQLResource = <T>(options: GraphQLResourceOptions<T>) => {
  const [state, setState] = createStore({
    loading: isServer,
    data: undefined as T | undefined,
    error: undefined as Error | undefined,
  })

  const [refresh, setRefresh] = createSignal(false)

  createEffect((previousRequest?: { cancelled: boolean }) => {
    if (refresh()) {
      setRefresh(false)
      return undefined
    }

    if (!options.variables || isServer) {
      return undefined
    }

    const request = {
      cancelled: false,
    }

    setState(state => ({
      ...state,
      loading: true,
    }))

    if (previousRequest) {
      previousRequest.cancelled = true
    }

    void (async () => {
      let data: typeof state.data = undefined
      let error: typeof state.error = undefined

      try {
        data = await fetchGraphQL<T>(options)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        error = e
      } finally {
        if (!request.cancelled) {
          setState(state => ({
            ...state,
            loading: false,
            data,
            error,
          }))
        }
      }
    })()

    return request
  })

  return {
    get loading() {
      return state.loading
    },
    get data() {
      return state.data
    },
    get error() {
      return state.error
    },
    refresh() {
      setRefresh(true)
    },
  }
}

export {
  createGraphQLResource,
}
