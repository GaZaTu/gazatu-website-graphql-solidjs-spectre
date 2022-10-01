export interface Query {
    __typename?: "Query";
    blogEntryById?: BlogEntry | null;
    blogEntryListConnection?: BlogEntryListConnection | null;
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
    blogEntrySave?: BlogEntry;
    blogEntryListRemoveByIds?: Void | null;
    userCreate?: Auth;
    userUpdate?: Void | null;
    userListRemoveByIds?: Void | null;
    triviaCategorySave?: TriviaCategory;
    triviaCategoryListVerifyByIds?: Void | null;
    triviaCategoryListRemoveByIds?: Void | null;
    triviaQuestionSave?: TriviaQuestion;
    triviaQuestionListVerifyByIds?: Void | null;
    triviaQuestionListDisableByIds?: Void | null;
    triviaReportSave?: TriviaReport;
    triviaReportListRemoveById?: Void | null;
    triviaReportListRemoveByQuestionId?: Void | null;
}
export interface BlogEntry {
    __typename?: "BlogEntry";
    id?: string | null;
    story?: string;
    title?: string;
    message?: string | null;
    imageFileExtension?: string | null;
    createdAt?: string | null;
}
export interface BlogEntryListConnection {
    __typename?: "BlogEntryListConnection";
    slice?: BlogEntry[];
    pageIndex?: number;
    pageCount?: number;
}
export interface BlogEntryListConnectionArgs {
    offset?: number | null;
    limit?: number | null;
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
export interface TriviaCategoryListArgs {
    verified?: boolean | null;
    disabled?: boolean | null;
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
export interface TriviaQuestionListConnectionArgs {
    offset?: number | null;
    limit?: number | null;
    orderBy?: OrderBy | null;
    search?: string | null;
    verified?: boolean | null;
    disabled?: boolean | null;
    shuffled?: boolean | null;
    includeCategories?: string[] | null;
    excludeCategories?: string[] | null;
    includeSubmitters?: string[] | null;
    excludeSubmitters?: string[] | null;
    categoryId?: string | null;
}
export interface OrderBy {
    col: string;
    dir?: SortDirection | null;
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
export interface BlogEntryInput {
    id?: string | null;
    story: string;
    title: string;
    message?: string | null;
    imageFileExtension?: string | null;
}
export type Void = unknown;
export interface UserInput {
    id?: string | null;
    username: string;
    roles: UserRoleInput[];
    createdAt?: string | null;
    updatedAt?: string | null;
}
export interface UserRoleInput {
    id?: string | null;
    name: string;
    description?: string | null;
}
export interface TriviaCategoryInput {
    id?: string | null;
    name: string;
    description?: string | null;
    submitter?: string | null;
}
export interface TriviaQuestionInput {
    id?: string | null;
    categories: TriviaCategoryInput[];
    question: string;
    answer: string;
    hint1?: string | null;
    hint2?: string | null;
    submitter?: string | null;
}
export interface TriviaReportInput {
    id?: string | null;
    question: TriviaQuestionInput;
    message: string;
    submitter: string;
}
