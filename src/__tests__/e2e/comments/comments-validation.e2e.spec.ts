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

describe('Comments API body/params/query validation', () => {
    const app = express()
    testingSetup(app)

    const postsTestManager = new TestManager(app, POSTS_PATH)
    const blogsTestManager = new TestManager(app, BLOGS_PATH)
    const commentsTestManager = new TestManager(app, COMMENTS_PATH)
    const usersTestManager = new TestManager(app, USERS_PATH)
    const authTestManager = new TestManager(app, AUTH_PATH)

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

    let accessToken: string
    let validBlogId: string
    let validPostId: string
    let validCommentId: string

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        await request(app)
            .delete(TESTING_PATH + '/all-data')
            .expect(HTTPStatusCode.NO_CONTENT)

        const createdBlog = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken,
            HTTPStatusCode.CREATED
        )

        validBlogId = createdBlog.body.id

        const validPostInput: PostInputModel = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const createdPost = await postsTestManager.createEntity(
            validPostInput,
            basicToken,
            HTTPStatusCode.CREATED
        )

        validPostId = createdPost.body.id


        await usersTestManager.createEntity(
            validUserInput, 
            basicToken,
            HTTPStatusCode.CREATED) 

        const accessTokenResponse = await authTestManager.createEntity(
            validLoginInput, 
            null,
            HTTPStatusCode.OK, 
            '/login') 

        accessToken = "Bearer " + accessTokenResponse.body.accessToken

        const createdComment = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.CREATED,
            `/${validPostId}` + '/comments'
        )

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
        await commentsTestManager.findEntity(
            null,
            HTTPStatusCode.OK,
            `/${validCommentId}`
        )

        // PUT in comment by id
        await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.NO_CONTENT,
            `/${validCommentId}`
        )

        // DELETE comment by id

        await commentsTestManager.deleteEntity(
            accessToken,
            HTTPStatusCode.NO_CONTENT,
            `/${validCommentId}`
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${invalidTypeId}`
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput2 = await commentsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST,
            `/${invalidFormatId}`
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('id')

        // PUT in comment by id
        const resForInvalidInput3 = await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput4 = await commentsTestManager.updateEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('id')

        // DELETE comment by id
        const resForInvalidInput5 = await commentsTestManager.deleteEntity(
            accessToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput6 = await commentsTestManager.deleteEntity(
            accessToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('content')

        const emptyInput = {
            content: '  '
        }

        const resForInvalidInput2 = await postsTestManager.createEntity(
            emptyInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('content')

        const shortContentInput = {
            content: 'lolol'
        }

        const resForInvalidInput3 = await postsTestManager.createEntity(
            shortContentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}` + '/comments'
        )
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('content')

        const longContentInput = {
            content: reallyLongDesc
        }

        const resForInvalidInput4 = await postsTestManager.createEntity(
            longContentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}` + '/comments'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validCommentId}`
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('content')

        const emptyInput = {
            content: '  '
        }

        const resForInvalidInput2 = await commentsTestManager.updateEntity(
            emptyInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validCommentId}`
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('content')

        const shortContentInput = {
            content: 'lolol'
        }

        const resForInvalidInput3 = await commentsTestManager.updateEntity(
            shortContentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validCommentId}`
        )
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('content')

        const longContentInput = {
            content: reallyLongDesc
        }

        const resForInvalidInput4 = await commentsTestManager.updateEntity(
            longContentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validCommentId}`
        )
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('content')
    })
})