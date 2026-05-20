import request from 'supertest'
import express from 'express'
import { BlogInputModel, } from '../../../blogs/models/blogTypes'
import { adminPass, adminUserName, AUTH_PATH, mongoUrl, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { CommentInputModel } from '../../../comments/models/commentTypes'
import { LoginInputModel, UserInputModel } from '../../../users/models/userTypes'
import { testingSetup } from '../../../testing/testing-setup-app'
import { TestManager } from '../utils/test-manager'

describe('Auth API body/params/query validation and jwt authorization test', () => {
    const app = express()
    testingSetup(app)

    const authTestManager = new TestManager(app, AUTH_PATH)
    const usersTestManager = new TestManager(app, USERS_PATH)

    const validBlogInput: BlogInputModel = {
        name: 'BlogName',
        description: 'some desc',
        websiteUrl: 'https://google.com'
    }

    const validUserInput: UserInputModel ={
        login: 'Alex',
        password: '123123',
        email: 'alex@gmail.com'
    }
    
    const validLoginInput: LoginInputModel = {
        loginOrEmail: 'Alex',
        password: '123123'
    }

    const validPostCommentInput: CommentInputModel = {
        content: 'some content lolololol'
    }

    const credentials = `${adminUserName}:${adminPass}`
    const basicToken = 'Basic ' + Buffer.from(credentials).toString('base64')


    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        const response1 = await request(app)
            .delete(TESTING_PATH + '/all-data')

        expect(response1.status).toBe(HTTPStatusCode.NO_CONTENT)

        const response2 = await usersTestManager.createEntity(
            validUserInput,
            basicToken)
        expect(response2.status).toBe(HTTPStatusCode.CREATED)
    })

    afterAll(async () => {
        await stopDb()
    })

    it(`should return errors if input data is invalid; 
        POST /api/auth/login`, async () => {

        const invalidTypeInput = {
            loginOrEmail: 123,
            password: 123
        }
        
        const resForInvalidInput1 = await authTestManager.createEntity(
            invalidTypeInput,
            null,
            '/login'
        )
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(2)

        const emptyInput = {
            loginOrEmail: '  ',
            password: '  '
        }

        const resForInvalidInput2 = await authTestManager.createEntity(
            emptyInput,
            null,
            '/login'
        )
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(2)
    })

    it(`should return errors if input data is invalid; 
        POST /api/auth/registration`, async () => {
        
        const invalidTypeInput = {
            login: 123,
            password: 123,
            email: 123
        }
        
        const resForInvalidInput1 = await authTestManager.createEntity(
            invalidTypeInput, 
            null,
            "/registration")
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            login: '  ',
            password: '  ',
            email: '  '
        }

        const resForInvalidInput2 = await authTestManager.createEntity(
            emptyInput, 
            null,
            "/registration")
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const shortLoginInput = {
            login: 'Al',
            password: '123123',
            email: 'al@mail.ru'
        }

        const longLoginInput = {
            login: 'Alalalalala',
            password: '123123',
            email: 'al@mail.ru'
        }

        const resForInvalidInput3 = await authTestManager.createEntity(
            shortLoginInput, 
            null,
            "/registration")
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('login')

        const resForInvalidInput4 = await authTestManager.createEntity(
            longLoginInput, 
            null,
            "/registration")
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('login')

        const shortPassInput = {
            login: 'Alex',
            password: '123',
            email: 'al@mail.ru'
        }

        const longPassInput = {
            login: 'Alex',
            password: '123123123123123123123',
            email: 'al@mail.ru'
        }

        const resForInvalidInput6 = await authTestManager.createEntity(
            shortPassInput, 
            null,
            "/registration")
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('password')

        const resForInvalidInput7 = await authTestManager.createEntity(
            longPassInput, 
            null,
            "/registration")
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('password')

        const invalidEmailInput = {
            login: 'Alex',
            password: '123123',
            email: 'al-mail.com'
        }

        const resForInvalidInput8 = await authTestManager.createEntity(
            invalidEmailInput, 
            null,
            "/registration")
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('email')
    })

    it(`should return errors if input data is invalid; 
        POST /api/auth/registration-confirmation
        POST /api/auth/registration-email-resending
        POST /api/auth/password-recovery
        POST /api/auth/new-password`, async () => {

        const invalidTypeCode = {
            code: 123
        }

        const resForInvalidInput1 = await authTestManager.createEntity(
            invalidTypeCode, 
            null,
            "/registration-confirmation")
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('code')

        const emptyCode = {
            code: ''
        }

        const resForInvalidInput2 = await authTestManager.createEntity(
            emptyCode, 
            null,
            "/registration-confirmation")
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('code')

        const invalidFormatCode = {
            code: '123'
        }

        const resForInvalidInput3 = await authTestManager.createEntity(
            invalidFormatCode, 
            null,
            "/registration-confirmation")
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('code')

        const invalidTypeEmail = {
            email: 123
        }

        const resForInvalidInput4 = await authTestManager.createEntity(
            invalidTypeEmail, 
            null,
            "/registration-email-resending")
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('email')

        const resForInvalidInput5 = await authTestManager.createEntity(
            invalidTypeEmail, 
            null,
            "/password-recovery")
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('email')

        const emptyEmail = {
            email: ''
        }

        const resForInvalidInput6 = await authTestManager.createEntity(
            emptyEmail, 
            null,
            "/registration-email-resending")
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('email')

        const resForInvalidInput7 = await authTestManager.createEntity(
            emptyEmail, 
            null,
            "/password-recovery")
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('email')

        const invalidFormatEmail = {
            email: '123'
        }

        const resForInvalidInput8 = await authTestManager.createEntity(
            invalidFormatEmail, 
            null,
            "/registration-email-resending")
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('email')

        const resForInvalidInput9 = await authTestManager.createEntity(
            invalidFormatEmail, 
            null,
            "/registration-email-resending")
        expect(resForInvalidInput9.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('email')

        const invalidTypePassword = {
            newPassword: 123
        }

        const resForInvalidInput10 = await authTestManager.createEntity(
            invalidTypePassword, 
            null,
            "/new-password")
        expect(resForInvalidInput10.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput10.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput10.body.errorsMessages[0].field).toEqual('newPassword')

        const emptyPassword = {
            newPassword: ''
        }

        const resForInvalidInput11 = await authTestManager.createEntity(
            emptyPassword, 
            null,
            "/new-password")
        expect(resForInvalidInput11.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput11.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput11.body.errorsMessages[0].field).toEqual('newPassword')

        const shortPassword = {
            newPassword: '123'
        }

        const resForInvalidInput12 = await authTestManager.createEntity(
            shortPassword, 
            null,
            "/new-password")
        expect(resForInvalidInput12.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput12.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput12.body.errorsMessages[0].field).toEqual('newPassword')

        const longPassword = {
            newPassword: '123123123123123123123123'
        }

        const resForInvalidInput13 = await authTestManager.createEntity(
            longPassword, 
            null,
            "/new-password")
        expect(resForInvalidInput13.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput13.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput13.body.errorsMessages[0].field).toEqual('newPassword')

    })
})