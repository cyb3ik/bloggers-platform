import request from 'supertest'
import express from 'express'
import { adminPass, adminUserName, mongoUrl, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { UserInputModel } from '../../../users/models/userTypes'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'


describe('Users API body/params/query validation', () => {
    const app = express()
    testingSetup(app)

    const usersTestManager = new TestManager(app, USERS_PATH)

    const validUserInput: UserInputModel ={
        login: 'Alex',
        password: '123123',
        email: 'alex@gmail.com'
    }

    const credentials = `${adminUserName}:${adminPass}`
    const basicToken = 'Basic ' + Buffer.from(credentials).toString('base64')

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        await request(app)
            .delete(TESTING_PATH + '/all-data')
            .expect(HTTPStatusCode.NO_CONTENT)
    })

    afterAll(async () => {
        await stopDb()
    })

    it(`should create user with valid input data / delete user with valid id;
        POST /api/users
        DELETE /api/users/:id`, async () => {

        const createdUser = await usersTestManager.createEntity(
            validUserInput, 
            basicToken, 
            HTTPStatusCode.CREATED)
        expect(HTTPStatusCode.CREATED)

        const validId = createdUser.body.id

        await usersTestManager.deleteEntity(
            basicToken, 
            HTTPStatusCode.NO_CONTENT, 
            `/${validId}`)
    })

    it(`should return error if ID in params is invalid; 
        DELETE /api/users/:id`, async () => {

        const invalidTypeId = {}
        const invalidFormatId = "123"

        const resForInvalidTypeId = await usersTestManager.deleteEntity(
            basicToken, 
            HTTPStatusCode.BAD_REQUEST,
            `/${invalidTypeId}`)
        expect(resForInvalidTypeId.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidTypeId.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidFormatId = await usersTestManager.deleteEntity(
            basicToken, 
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
        expect(resForInvalidFormatId.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidFormatId.body.errorsMessages[0].field).toEqual('id')
    })

    it('should not create user with invalid input body; POST /api/users', async () =>{
        
        const invalidTypeInput = {
            login: 123,
            password: 123,
            email: 123
        }
        
        const resForInvalidInput1 = await usersTestManager.createEntity(
            invalidTypeInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            login: '  ',
            password: '  ',
            email: '  '
        }

        const resForInvalidInput2 = await usersTestManager.createEntity(
            emptyInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
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

        const resForInvalidInput3 = await usersTestManager.createEntity(
            shortLoginInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('login')

        const resForInvalidInput4 = await usersTestManager.createEntity(
            longLoginInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
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

        const resForInvalidInput6 = await usersTestManager.createEntity(
            shortPassInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('password')

        const resForInvalidInput7 = await usersTestManager.createEntity(
            longPassInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('password')

        const invalidEmailInput = {
            login: 'Alex',
            password: '123123',
            email: 'al-mail.com'
        }

        const resForInvalidInput8 = await usersTestManager.createEntity(
            invalidEmailInput, 
            basicToken, 
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('email')
        
    })

//     it('should return errors if query pagination params is invalid; GET /api/users', async () => {
        
//         const resForDefaultPagination = await request(app)
//             .get(USERS_PATH)
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.OK)

//         expect(resForDefaultPagination.body.page).toBe(1)
//         expect(resForDefaultPagination.body.pageSize).toBe(10)
//         expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

//         const resForValidPagination = await request(app)
//             .get(USERS_PATH + '?pageSize=1&pageNumber=2')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.OK)

//         expect(resForValidPagination.body.page).toBe(2)
//         expect(resForValidPagination.body.pageSize).toBe(1)
//         expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
//         // PAGE SIZE
//         const resForInvalidPageSize1 = await request(app)
//             .get(USERS_PATH + '?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize2 = await request(app)
//             .get(USERS_PATH + '?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize3 = await request(app)
//             .get(USERS_PATH + '?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

//         // PAGE NUMBER
//         const resForInvalidPageNumber1 = await request(app)
//             .get(USERS_PATH + '?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageNumber2 = await request(app)
//             .get(USERS_PATH + '?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

//         // SORT DIRECTION
//         const resForInvalidSortDirection = await request(app)
//             .get(USERS_PATH + '?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
//         // SORT BY
//         const resForInvalidSortBy = await request(app)
//             .get(USERS_PATH + '?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
//             .set('Authorization', token)
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
//     })
})