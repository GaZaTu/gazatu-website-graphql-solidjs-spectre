export interface Query {
    __typename?: "Query";
    authenticate?: Auth;
    triviaCategory?: TriviaCategory | null;
    triviaCategories?: TriviaCategory[];
    triviaQuestion?: TriviaQuestion | null;
    triviaQuestionsConnection?: TriviaQuestionsConnection | null;
}
export interface Auth {
    __typename?: "Auth";
    token?: string;
    user?: User;
}
export interface User {
    __typename?: "User";
    id?: string | null;
    username?: string;
    roles?: UserRole[];
    createdAt?: string | null;
    updatedAt?: string | null;
}
export interface UserRole {
    __typename?: "UserRole";
    id?: string | null;
    name?: string;
    description?: string | null;
}
export interface TriviaCategory {
    __typename?: "TriviaCategory";
    id?: string | null;
    name?: string;
    description?: string | null;
    submitter?: string | null;
    verified?: boolean | null;
    disabled?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}
export interface TriviaQuestion {
    __typename?: "TriviaQuestion";
    id?: string | null;
    categories?: TriviaCategory[];
    question?: string;
    answer?: string;
    hint1?: string | null;
    hint2?: string | null;
    submitter?: string | null;
    verified?: boolean | null;
    disabled?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}
export interface TriviaQuestionsConnection {
    __typename?: "TriviaQuestionsConnection";
    slice?: TriviaQuestion[];
    pageIndex?: number;
    pageCount?: number;
}
export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export interface Mutation {
    __typename?: "Mutation";
    registerUser?: Auth;
    saveTriviaCategory?: TriviaCategory;
    saveTriviaQuestion?: TriviaQuestion;
    verifyTriviaQuestions?: Void | null;
    disableTriviaQuestions?: Void | null;
}
export type Void = unknown;
export interface Subscription {
    __typename?: "Subscription";
    triviaSSE?: string;
}
