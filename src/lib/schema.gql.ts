export interface Query {
    __typename?: "Query";
    userById?: User | null;
    userList?: User[];
    userRoleList?: UserRole[];
    userAuthenticate?: Auth;
    triviaCategoryById?: TriviaCategory | null;
    triviaCategoryList?: TriviaCategory[];
    triviaQuestionById?: TriviaQuestion | null;
    triviaQuestionListConnection?: TriviaQuestionListConnection | null;
    triviaEventsOTP?: string;
    triviaReportById?: TriviaReport | null;
    triviaReportList?: TriviaReport[];
    triviaCounts?: TriviaCounts;
}
export interface Mutation {
    __typename?: "Mutation";
    userCreate?: Auth;
    userUpdate?: Void | null;
    userRemove?: Void | null;
    triviaCategorySave?: TriviaCategory;
    triviaCategoryVerifyByIds?: Void | null;
    triviaCategoryRemoveByIds?: Void | null;
    triviaQuestionSave?: TriviaQuestion;
    triviaQuestionVerifyByIds?: Void | null;
    triviaQuestionDisableByIds?: Void | null;
    triviaReportSave?: TriviaReport;
    triviaReportRemoveById?: Void | null;
    triviaReportRemoveByQuestionId?: Void | null;
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
export interface Auth {
    __typename?: "Auth";
    token?: string;
    user?: User;
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
    questionsCount?: number;
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
    updatedBy?: User | null;
    reportsCount?: number;
    reports?: TriviaReport[];
}
export interface TriviaQuestionListConnection {
    __typename?: "TriviaQuestionListConnection";
    slice?: TriviaQuestion[];
    pageIndex?: number;
    pageCount?: number;
}
export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export interface TriviaReport {
    __typename?: "TriviaReport";
    id?: string | null;
    question?: TriviaQuestion;
    message?: string;
    submitter?: string;
    createdAt?: string | null;
}
export interface TriviaCounts {
    __typename?: "TriviaCounts";
    questions?: number;
    questionsNotVerified?: number;
    categories?: number;
    categoriesNotVerified?: number;
    reports?: number;
}
export type Void = unknown;
