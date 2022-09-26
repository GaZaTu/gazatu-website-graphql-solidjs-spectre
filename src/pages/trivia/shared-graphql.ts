import fetchGraphQL, { gql } from "../../lib/fetchGraphQL"
import { Mutation } from "../../lib/schema.gql"

export const verifyTriviaCategories = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        triviaCategoryListVerifyByIds(ids: $ids)
      }
    `,
    variables: { ids },
  })
}

export const removeTriviaCategories = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        triviaCategoryListRemoveByIds(ids: $ids)
      }
    `,
    variables: { ids },
  })
}

export const verifyTriviaQuestions = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        triviaQuestionListVerifyByIds(ids: $ids)
      }
    `,
    variables: { ids },
  })
}

export const disableTriviaQuestions = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        triviaQuestionListDisableByIds(ids: $ids)
      }
    `,
    variables: { ids },
  })
}

export const removeTriviaReports = async (ids: string[]) => {
  await fetchGraphQL<Mutation>({
    query: gql`
      mutation ($ids: [String!]!) {
        triviaReportListRemoveById(ids: $ids)
      }
    `,
    variables: { ids },
  })
}
