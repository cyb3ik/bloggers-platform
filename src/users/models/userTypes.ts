import { paginatedInput } from "../../core/pagination/paginationTypes"

export type UserOutputModel = {
    id: string
    login: string
    email: string
    createdAt: string
}

export type UserInputModel = {
    login: string
    password: string
    email: string
}

export type LoginInputModel = {
    loginOrEmail: string
    password: string}

export type RawUser = {
    login: string
    email: string
    createdAt: string
    passwordSalt: string
    passwordHash: string
    emailConfirmation: {
        confirmationCode: string
        expirationDate: Date
        isConfirmed: boolean
    }
}

export enum UserSortAttributes {
    id = 'id',
    login = 'login',
    email = 'email',
    createdAt = 'createdAt'
}

export type PaginationUserQuery = paginatedInput<UserSortAttributes> & 
Partial<{
    searchLoginTerm: string,
    searchEmailTerm: string
}>