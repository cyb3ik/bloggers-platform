import request from 'supertest'
import express from 'express'
import { adminPass, adminUserName, AUTH_PATH, mongoUrl, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { LoginInputModel, UserInputModel, UserOutputModel } from '../../../users/models/userTypes'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'
import { ObjectId } from 'mongodb'


describe('Users API endpoints tests', () => {
    const app = express()
    testingSetup(app)

    const usersTestManager = new TestManager(app, USERS_PATH)

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')

        const res = await request(app)
            .delete(TESTING_PATH + '/all-data')

        expect(res.status).toBe(HTTPStatusCode.NO_CONTENT)
    })

    afterAll(async () => {
        await stopDb()
    })

    beforeEach(async () => {
        const res = await request(app)
            .delete(TESTING_PATH + '/all-data')

        expect(res.status).toBe(HTTPStatusCode.NO_CONTENT)
    })

    it(`should return unathorized if auth token is not provided or wrong
        GET /api/users
        POST /api/users
        DELETE /api/users/:userId`, async () => {
        
        const res0 = await usersTestManager.findEntity(
            invalidToken
        )

        const res1 = await usersTestManager.findEntity(
            ''
        )

        expect(res0.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res1.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res2 = await usersTestManager.createEntity(
            validUserInput1,
            invalidToken
        )

        const res3 = await usersTestManager.createEntity(
            validUserInput1,
            ''
        )

        expect(res2.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res3.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res4 = await usersTestManager.deleteEntity(
            invalidToken,
            `/${new ObjectId()}`
        )

        const res5 = await usersTestManager.createEntity(
            '',
            `/${new ObjectId()}`
        )

        expect(res4.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res5.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        })

    it(`should return list of all users after some was created or deleted
        GET /api/users
        additional methods: 
        POST /api/users
        DELETE /api/users/:userId`, async () => {

        const res0 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const usersList0 = res0.body.items

        expect(usersList0).toBeInstanceOf(Array)
        expect(usersList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            validUserInput1,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const userBody1 = res1.body

        const res2 = await usersTestManager.createEntity(
            validUserInput2,
            basicToken)
        expect(res2.status).toBe(HTTPStatusCode.CREATED)

        const userBody2 = res2.body

        const res3 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res3.status).toBe(HTTPStatusCode.OK)

        const usersList1 = res3.body.items

        expect(usersList1).toBeInstanceOf(Array)
        expect(usersList1).toHaveLength(2)

        expect(usersList1).toContainEqual(userBody1)
        expect(usersList1).toContainEqual(userBody2)

        const res4 = await usersTestManager.deleteEntity(
            basicToken,
            `/${userBody1.id}`
        )
        expect(res4.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res5 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res5.status).toBe(HTTPStatusCode.OK)

        const usersList2 = res5.body.items

        expect(usersList2).toBeInstanceOf(Array)
        expect(usersList2).toHaveLength(1)

        expect(usersList2).not.toContainEqual(userBody1)
        expect(usersList2).toContainEqual(userBody2)

        const res6 = await usersTestManager.deleteEntity(
            basicToken,
            `/${userBody2.id}`
        )
        expect(res6.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res7 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res7.status).toBe(HTTPStatusCode.OK)

        const usersList3 = res7.body.items

        expect(usersList3).toBeInstanceOf(Array)
        expect(usersList3).toHaveLength(0)
        expect(usersList3).not.toContainEqual(userBody1)
        expect(usersList3).not.toContainEqual(userBody2)
    })

    it(`should create user with valid input data
        POST /api/users
        additional methods: 
        GET /api/users`, async () => {

        const res0 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const usersList0 = res0.body.items

        expect(usersList0).toBeInstanceOf(Array)
        expect(usersList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            validUserInput1,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdUserData = res1.body

        expect(createdUserData).toMatchObject<UserOutputModel>({
            id: expect.any(String),
            login: validUserInput1.login,
            email: validUserInput1.email,
            createdAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([Zz]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?$/)
        })

        const res2 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const usersList1 = res2.body.items

        expect(usersList1).toBeInstanceOf(Array)
        expect(usersList1).toHaveLength(1)
        expect(usersList1).toContainEqual(createdUserData)

        expect(createdUserData).toMatchObject<UserOutputModel>
    })

    it(`should not create user with invalid input data
        POST /api/users
        additional methods: 
        GET /api/users`, async () => {

        const invalidUserInput: UserInputModel = {
            login: 'Al',
            password: '123',
            email: 'al-mail.ru'
        }

        const res0 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const usersList0 = res0.body.items

        expect(usersList0).toBeInstanceOf(Array)
        expect(usersList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            invalidUserInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.BAD_REQUEST)

        expect(res1.body.errorsMessages).toEqual(
            expect.arrayContaining([
                {
                    message: expect.any(String),
                    field: 'login'
                },
                {
                    message: expect.any(String),
                    field: 'email'
                },
                {
                    message: expect.any(String),
                    field: 'password'
                }
            ])
        )

        const res2 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const usersList1 = res2.body.items

        expect(usersList1).toBeInstanceOf(Array)
        expect(usersList1).toHaveLength(0)
    })

    it(`should delete created user
        DELETE /api/users/:userId
        additional methods: 
        GET /api/users
        POST /api/users`, async () => {

        const res0 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const usersList0 = res0.body.items

        expect(usersList0).toBeInstanceOf(Array)
        expect(usersList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            validUserInput1,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdUserData = res1.body

        const res2 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const usersList1 = res2.body.items

        expect(usersList1).toBeInstanceOf(Array)
        expect(usersList1).toHaveLength(1)
        expect(usersList1).toContainEqual(createdUserData)


        const res3 = await usersTestManager.deleteEntity(
            basicToken,
            `/${createdUserData.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res4 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res4.status).toBe(HTTPStatusCode.OK)

        const usersList2 = res4.body.items

        expect(usersList2).toBeInstanceOf(Array)
        expect(usersList2).toHaveLength(0)
        expect(usersList2).not.toContainEqual(createdUserData)
    })

    it(`should not delete created user if had troubles with access
        DELETE /api/users/:userId
        additional methods: 
        GET /api/users
        POST /api/users`, async () => {

        const res0 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const usersList0 = res0.body.items

        expect(usersList0).toBeInstanceOf(Array)
        expect(usersList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            validUserInput1,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdUserData = res1.body

        const res2 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const usersList1 = res2.body.items

        expect(usersList1).toBeInstanceOf(Array)
        expect(usersList1).toHaveLength(1)
        expect(usersList1).toContainEqual(createdUserData)


        const res3 = await usersTestManager.deleteEntity(
            invalidToken,
            `/${createdUserData.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res4 = await usersTestManager.deleteEntity(
            basicToken,
            `/${createdUserData.id} + 'lol'`
        )
        expect(res4.status).toBe(HTTPStatusCode.BAD_REQUEST)

        const res5 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res5.status).toBe(HTTPStatusCode.OK)

        const usersList2 = res5.body.items

        expect(usersList2).toBeInstanceOf(Array)
        expect(usersList2).toHaveLength(1)
        expect(usersList2).toContainEqual(createdUserData)
    })
})
