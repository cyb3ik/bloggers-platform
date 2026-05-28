import { BlogInputModel, BlogPostInputModel } from "../../../blogs/models/blogTypes"
import { CommentInputModel } from "../../../comments/models/commentTypes"
import { adminPass, adminUserName } from "../../../core/settings/config"
import { LoginInputModel, UserInputModel } from "../../../users/models/userTypes"

export const dateRegExp = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/

export const validUserInput1: UserInputModel ={
        login: 'Alex',
        password: '123123',
        email: 'alex@gmail.com'
    }

export const validUserInput2: UserInputModel ={
        login: 'Sergey',
        password: '123123',
        email: 'sergey@gmail.com'
    }

export const validLoginInput1: LoginInputModel = {
        loginOrEmail: 'Alex',
        password: '123123'
    }

export const validLoginInput2: LoginInputModel = {
        loginOrEmail: 'Sergey',
        password: '123123'
    }

export const validBlogInput: BlogInputModel = {
        name: 'BlogName',
        description: 'some desc',
        websiteUrl: 'https://google.com'
    }

export const validBlogPostInput: BlogPostInputModel = {
        title: 'lolol',
        shortDescription: 'lolol',
        content: 'lolol'
    }

export const validPostCommentInput: CommentInputModel = {
        content: 'some content lolololol'
    }

const credentials = `${adminUserName}:${adminPass}`
export const basicToken = 'Basic ' + Buffer.from(credentials).toString('base64')

const invalidCredentials = `${adminUserName}:${adminPass + 'lol'}`
export const invalidToken = 'Basic ' + Buffer.from(invalidCredentials).toString('base64')