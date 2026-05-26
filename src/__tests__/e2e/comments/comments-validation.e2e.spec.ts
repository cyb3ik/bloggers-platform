import request from 'supertest'
import express from 'express'
import { BlogInputModel, } from '../../../blogs/models/blogTypes'
import { adminPass, adminUserName, AUTH_PATH, BLOGS_PATH, COMMENTS_PATH, mongoUrl, POSTS_PATH, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { reallyLongDesc } from '../utils/validation-strings'
import { CommentInputModel } from '../../../comments/models/commentTypes'
import { PostInputModel } from '../../../posts/models/postTypes'
import { LoginInputModel, UserInputModel } from '../../../users/models/userTypes'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'
import { basicToken, validBlogInput, validLoginInput1, validPostCommentInput, validUserInput1 } from '../utils/fixtures'

describe('Comments API body/params/query validation', () => {
    const app = express()
    testingSetup(app)

    const postsTestManager = new TestManager(app, POSTS_PATH)
    const blogsTestManager = new TestManager(app, BLOGS_PATH)
    const commentsTestManager = new TestManager(app, COMMENTS_PATH)
    const usersTestManager = new TestManager(app, USERS_PATH)
    const authTestManager = new TestManager(app, AUTH_PATH)

    let accessToken: string
    let validBlogId: string
    let validPostId: string
    let validCommentId: string

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        const response1 = await request(app)
            .delete(TESTING_PATH + '/all-data')

        expect(response1.status).toBe(HTTPStatusCode.NO_CONTENT)

        const createdBlog = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(createdBlog.status).toBe(HTTPStatusCode.CREATED)

        validBlogId = createdBlog.body.id

        const validPostInput: PostInputModel = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const createdPost = await postsTestManager.createEntity(
            validPostInput,
            basicToken)
        expect(createdPost.status).toBe(HTTPStatusCode.CREATED)

        validPostId = createdPost.body.id


        const response2 = await usersTestManager.createEntity(
            validUserInput1, 
            basicToken) 
        expect(response2.status).toBe(HTTPStatusCode.CREATED)

        const accessTokenResponse = await authTestManager.createEntity(
            validLoginInput1, 
            null, 
            '/login') 
        expect(accessTokenResponse.status).toBe(HTTPStatusCode.OK)

        accessToken = "Bearer " + accessTokenResponse.body.accessToken

        const createdComment = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken,
            `/${validPostId}` + '/comments'
        )
        expect(createdComment.status).toBe(HTTPStatusCode.CREATED)

        validCommentId = createdComment.body.id
    })

    afterAll(async () => {
        await stopDb()
    })

    it(`should not return error if ID in params is valid; 
        GET /api/comments/:id; 
        PUT /api/comments/:id;
        DELETE /api/comments/:id`, async () => {

        // GET comment by id
        const response3 = await commentsTestManager.findEntity(
            null,
            `/${validCommentId}`
        )
        expect(response3.status).toBe(HTTPStatusCode.OK)

        // PUT in comment by id
        const response4 = await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken,
            `/${validCommentId}`
        )
        expect(response4.status).toBe(HTTPStatusCode.NO_CONTENT)

        // DELETE comment by id

        const response5 = await commentsTestManager.deleteEntity(
            accessToken,
            `/${validCommentId}`
        )
        expect(response5.status).toBe(HTTPStatusCode.NO_CONTENT)
    })

    it(`should return error if ID in params is invalid; 
        GET /api/comments/:id; 
        PUT /api/comments/:id;
        DELETE /api/comments/:id`, async () => {

        const invalidTypeId = {}
        const invalidFormatId = '123'

        // GET comment by id
        const resForInvalidInput1 = await commentsTestManager.findEntity(
            null,
            `/${invalidTypeId}`
        )
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput2 = await commentsTestManager.findEntity(
            null,
            `/${invalidFormatId}`
        )
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('id')

        // PUT in comment by id
        const resForInvalidInput3 = await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput4 = await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('id')

        // DELETE comment by id
        const resForInvalidInput5 = await commentsTestManager.deleteEntity(
            accessToken, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput6 = await commentsTestManager.deleteEntity(
            accessToken, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('id')
    })

    it('should not create comment for post with invalid input data; POST /api/posts/:postId/comments', async () => {
        
        const invalidTypeInput = {
            content: 123
        }

        const resForInvalidInput1 = await postsTestManager.createEntity(
            invalidTypeInput,
            accessToken,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('content')

        const emptyInput = {
            content: '  '
        }

        const resForInvalidInput2 = await postsTestManager.createEntity(
            emptyInput,
            accessToken,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('content')

        const shortContentInput = {
            content: 'lolol'
        }

        const resForInvalidInput3 = await postsTestManager.createEntity(
            shortContentInput,
            accessToken,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('content')

        const longContentInput = {
            content: reallyLongDesc
        }

        const resForInvalidInput4 = await postsTestManager.createEntity(
            longContentInput,
            accessToken,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('content')
    })

    it('should not update comment with invalid input data; PUT /api/comments/:id', async () => {
        const invalidTypeInput = {
            content: 123
        }

        const resForInvalidInput1 = await commentsTestManager.updateEntity(
            invalidTypeInput,
            accessToken,
            `/${validCommentId}`
        )
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('content')

        const emptyInput = {
            content: '  '
        }

        const resForInvalidInput2 = await commentsTestManager.updateEntity(
            emptyInput,
            accessToken,
            `/${validCommentId}`
        )
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('content')

        const shortContentInput = {
            content: 'lolol'
        }

        const resForInvalidInput3 = await commentsTestManager.updateEntity(
            shortContentInput,
            accessToken,
            `/${validCommentId}`
        )
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('content')

        const longContentInput = {
            content: reallyLongDesc
        }

        const resForInvalidInput4 = await commentsTestManager.updateEntity(
            longContentInput,
            accessToken,
            `/${validCommentId}`
        )
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('content')
    })
})