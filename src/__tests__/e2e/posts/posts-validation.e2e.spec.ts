import request from 'supertest'
import express from 'express'
import { BlogInputModel, } from '../../../blogs/models/blogTypes'
import { adminPass, adminUserName, AUTH_PATH, BLOGS_PATH, mongoUrl, POSTS_PATH, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { longTitle, reallyLongDesc } from '../utils/validation-strings'
import { CommentInputModel } from '../../../comments/models/commentTypes'
import { PostInputModel } from '../../../posts/models/postTypes'
import { LoginInputModel, UserInputModel } from '../../../users/models/userTypes'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'
import { basicToken, validBlogInput, validLoginInput1, validPostCommentInput, validUserInput1 } from '../utils/fixtures'

describe('Posts API body/params/query validation', () => {
    const app = express()
    testingSetup(app)

    const postsTestManager = new TestManager(app, POSTS_PATH)
    const blogsTestManager = new TestManager(app, BLOGS_PATH)
    const usersTestManager = new TestManager(app, USERS_PATH)
    const authTestManager = new TestManager(app, AUTH_PATH)

    let accessToken: string
    let validBlogId: string

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        const response1 = await request(app)
            .delete(TESTING_PATH + '/all-data')

        expect(response1.status).toBe(HTTPStatusCode.NO_CONTENT)
        
        // creating blog for further usage of its id
        const createdBlog = await blogsTestManager.createEntity(
            validBlogInput, 
            basicToken)
        expect(createdBlog.status).toBe(HTTPStatusCode.CREATED)

        validBlogId = createdBlog.body.id

        // creating user for further usage of his access token
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
    })

    afterAll(async () => {
        await stopDb()
    })

    it(`should not return error if ID in params is valid; 
        GET /api/posts/:id
        GET /api/posts/:postId/comments
        POST /api/posts/:postId/comments
        PUT /api/posts/:id
        DELETE /api/posts/:id`, async () => {

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

        const validPostId = createdPost.body.id
        
        // GET post by id
        const response3 = await postsTestManager.findEntity(
            null, 
            `/${validPostId}`)
        expect(response3.status).toBe(HTTPStatusCode.OK)
        
        // GET comments from post by id
        const response4 = await postsTestManager.findEntity(
            null, 
            `/${validPostId}` + '/comments')
        expect(response4.status).toBe(HTTPStatusCode.OK)
        
        // POST comment in post
        const response5 = await postsTestManager.createEntity(
            validPostCommentInput, 
            accessToken, 
            `/${createdPost.body.id}` + '/comments')
        expect(response5.status).toBe(HTTPStatusCode.CREATED)

        // PUT in post by id
        const response6 = await postsTestManager.updateEntity(
            validPostInput, 
            basicToken, 
            `/${validPostId}`)
        expect(response6.status).toBe(HTTPStatusCode.NO_CONTENT)

        // DELETE post by id
        const response7 = await postsTestManager.deleteEntity(
            basicToken, 
            `/${validPostId}`)
        expect(response7.status).toBe(HTTPStatusCode.NO_CONTENT)
    })

    it(`should return error if ID in params is invalid; 
        GET /api/posts/:id
        GET /api/posts/:postId/comments
        POST /api/posts/:postId/comments
        PUT /api/posts/:id
        DELETE /api/posts/:id`, async () => {

        const validPostInput: PostInputModel = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const invalidTypeId = {}
        const invalidFormatId = '123'

        // GET post by id
        const resForInvalidInput1 = await postsTestManager.findEntity(
            null, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput2 = await postsTestManager.findEntity(
            null, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('id')
        
        // GET comments from post by id
        const resForInvalidInput3 = await postsTestManager.findEntity(
            null, 
            `/${invalidTypeId}` + '/comments')
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('postId')

        const resForInvalidInput4 = await postsTestManager.findEntity(
            null, 
            `/${invalidFormatId}` + '/comments')
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('postId')
        
        // POST comment in post
        const resForInvalidInput5 = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken, 
            `/${invalidTypeId}` + '/comments')
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('postId')

        const resForInvalidInput6 = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken,
            `/${invalidFormatId}` + '/comments')
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('postId')

        // PUT in post by id
        const resForInvalidInput7 = await postsTestManager.updateEntity(
            validPostInput,
            basicToken, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput8 = await postsTestManager.updateEntity(
            validPostInput,
            basicToken, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)

        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('id')

        // DELETE post by id
        const resForInvalidInput9 = await postsTestManager.deleteEntity(
            basicToken, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput9.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput10 = await postsTestManager.deleteEntity(
            basicToken, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput10.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput10.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput10.body.errorsMessages[0].field).toEqual('id')
    })

    it('should not create post with invalid input body; POST /api/posts', async () =>{
        
        const invalidTypeInput = {
            title: 123,
            shortDescription: 123,
            content: 123,
            blogId: 123
        }
        
        const resForInvalidInput1 = await postsTestManager.createEntity(
            invalidTypeInput, 
            basicToken)
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(4)

        const emptyInput = {
            title: '  ',
            shortDescription: '  ',
            content: '  ',
            blogId: validBlogId
        }

        const resForInvalidInput2 = await postsTestManager.createEntity(
            emptyInput, 
            basicToken)
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const emptyTitleInput = {
            title: '  ',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput3 = await postsTestManager.createEntity(
            emptyTitleInput, 
            basicToken)
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('title')

        const emptyDescInput = {
            title: 'PostTitle',
            shortDescription: '  ',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput4 = await postsTestManager.createEntity(
            emptyDescInput, 
            basicToken)
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('shortDescription')

        const emptyContentInput = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: '  ',
            blogId: validBlogId
        }

        const resForInvalidInput5 = await postsTestManager.createEntity(
            emptyContentInput, 
            basicToken)
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('content')

        const longTitleInput = {
            title: longTitle,
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput6 = await postsTestManager.createEntity(
            longTitleInput, 
            basicToken)
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('title')

        const longDescInput = {
            title: 'PostTitle',
            shortDescription: reallyLongDesc,
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput7 = await postsTestManager.createEntity(
            longDescInput, 
            basicToken)
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('shortDescription')

        const longContentInput = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: reallyLongDesc.repeat(2),
            blogId: validBlogId
        }

        const resForInvalidInput8 = await postsTestManager.createEntity(
            longContentInput, 
            basicToken)
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('content')

        const invalidTypeOfBlogIdInput: PostInputModel = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: "12312134"
        }
        
        const resForInvalidInput9 = await postsTestManager.createEntity(
            invalidTypeOfBlogIdInput, 
            basicToken)
        expect(resForInvalidInput9.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('blogId')
    })

    it('should not create post for blog with invalid input data; POST /api/blogs/:blogId/posts', async () => {

        const invalidTypeInput = {
            title: 123,
            shortDescription: 123,
            content: 123
        }
        
        const resForInvalidInput1 = await blogsTestManager.createEntity(
            invalidTypeInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            title: '  ',
            shortDescription: '  ',
            content: '  '
        }

        const resForInvalidInput2 = await blogsTestManager.createEntity(
            emptyInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const emptyTitleInput = {
            title: '  ',
            shortDescription: 'lolol',
            content: 'lolol'
        }

        const resForInvalidInput3 = await blogsTestManager.createEntity(
            emptyTitleInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('title')

        const emptyDescInput = {
            title: 'lolol',
            shortDescription: '  ',
            content: 'lolol'
        }

        const resForInvalidInput4 = await blogsTestManager.createEntity(
            emptyDescInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('shortDescription')

        const emptyContentInput = {
            title: 'lolol',
            shortDescription: 'lolol',
            content: '  '
        }

        const resForInvalidInput5 = await blogsTestManager.createEntity(
            emptyContentInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('content')

        const longTitleInput = {
            title: longTitle,
            shortDescription: 'lolol',
            content: 'lolol'
        }

        const resForInvalidInput6 = await blogsTestManager.createEntity(
            longTitleInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('title')

        const longDescInput = {
            title: 'lolol',
            shortDescription: reallyLongDesc,
            content: 'lolol'
        }

        const resForInvalidInput7 = await blogsTestManager.createEntity(
            longDescInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('shortDescription')

        const longContentInput = {
            title: 'lolol',
            shortDescription: 'lolol',
            content: reallyLongDesc.repeat(2)
        }

        const resForInvalidInput8 = await blogsTestManager.createEntity(
            longContentInput,
            basicToken,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('content')
    })

    it('should not update post with invalid input data; PUT /api/posts/:id', async () => {

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

        const validPostId = createdPost.body.id
        
        const invalidTypeInput = {
            title: 123,
            shortDescription: 123,
            content: 123,
            blogId: 123
        }
        
        const resForInvalidInput1 = await postsTestManager.updateEntity(
            invalidTypeInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(4)

        const emptyInput = {
            title: '  ',
            shortDescription: '  ',
            content: '  ',
            blogId: validBlogId
        }

        const resForInvalidInput2 = await postsTestManager.updateEntity(
            emptyInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const emptyTitleInput = {
            title: '  ',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput3 = await postsTestManager.updateEntity(
            emptyTitleInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('title')

        const emptyDescInput = {
            title: 'PostTitle',
            shortDescription: '  ',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput4 = await postsTestManager.updateEntity(
            emptyDescInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput4.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('shortDescription')

        const emptyContentInput = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: '  ',
            blogId: validBlogId
        }

        const resForInvalidInput5 = await postsTestManager.updateEntity(
            emptyContentInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput5.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('content')

        const longTitleInput = {
            title: longTitle,
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput6 = await postsTestManager.updateEntity(
            longTitleInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput6.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('title')

        const longDescInput = {
            title: 'PostTitle',
            shortDescription: reallyLongDesc,
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput7 = await postsTestManager.updateEntity(
            longDescInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput7.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('shortDescription')

        const longContentInput = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: reallyLongDesc.repeat(2),
            blogId: validBlogId
        }

        const resForInvalidInput8 = await postsTestManager.updateEntity(
            longContentInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput8.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('content')

        const invalidTypeOfBlogIdInput: PostInputModel = {
            title: 'PostTitle',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: "12312134"
        }
        
        const resForInvalidInput9 = await postsTestManager.updateEntity(
            invalidTypeOfBlogIdInput, 
            basicToken,
            `/${validPostId}`)
        expect(resForInvalidInput9.status).toBe(HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('blogId')
    })

//     it('should return errors if query pagination params is invalid; GET /api/posts', async () => {
        
//         const resForDefaultPagination = await request(app)
//             .get(POSTS_PATH)
//             expect(resForDefaultPagination.status).toBe(HTTPStatusCode.OK)

//         expect(resForDefaultPagination.body.page).toBe(1)
//         expect(resForDefaultPagination.body.pageSize).toBe(10)
//         expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

//         const resForValidPagination = await request(app)
//             .get(POSTS_PATH + '?pageSize=1&pageNumber=2')
//             expect(resForValidPagination.status).toBe(HTTPStatusCode.OK)

//         expect(resForValidPagination.body.page).toBe(2)
//         expect(resForValidPagination.body.pageSize).toBe(1)
//         expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
//         // PAGE SIZE
//         const resForInvalidPageSize1 = await request(app)
//             .get(POSTS_PATH + '?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize2 = await request(app)
//             .get(POSTS_PATH + '?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize3 = await request(app)
//             .get(POSTS_PATH + '?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

//         // PAGE NUMBER
//         const resForInvalidPageNumber1 = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageNumber1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageNumber2 = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageNumber2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

//         // SORT DIRECTION
//         const resForInvalidSortDirection = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
//             expect(resForInvalidSortDirection.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
//         // SORT BY
//         const resForInvalidSortBy = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
//             expect(resForInvalidSortBy.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
//     })

//     it('should return errors if query pagination params is invalid; GET /api/posts/:postId/comments', async () => {

//         const createdBlog = await request(app)
//             .post(BLOGS_PATH)
//             .set('Authorization', token)
//             .send(validBlogInput)
//             expect(createdBlog.status).toBe(HTTPStatusCode.CREATED)
        
//         const validPostInput: PostInputModel = {
//             title: 'PostTitle',
//             shortDescription: 'some desc',
//             content: 'some content',
//             blogId: createdBlog.body.id
//         }

//         const createdPost = await request(app)
//             .post(POSTS_PATH)
//             .set('Authorization', token)
//             .send(validPostInput)
//             expect(createdPost.status).toBe(HTTPStatusCode.CREATED)
        
//         const resForDefaultPagination = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments')
//             expect(resForDefaultPagination.status).toBe(HTTPStatusCode.OK)

//         expect(resForDefaultPagination.body.page).toBe(1)
//         expect(resForDefaultPagination.body.pageSize).toBe(10)
//         expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

//         const resForValidPagination = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=1&pageNumber=2')
//             expect(resForValidPagination.status).toBe(HTTPStatusCode.OK)

//         expect(resForValidPagination.body.page).toBe(2)
//         expect(resForValidPagination.body.pageSize).toBe(1)
//         expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
//         // PAGE SIZE
//         const resForInvalidPageSize1 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize2 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize3 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageSize3.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

//         // PAGE NUMBER
//         const resForInvalidPageNumber1 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageNumber1.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageNumber2 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
//             expect(resForInvalidPageNumber2.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

//         // SORT DIRECTION
//         const resForInvalidSortDirection = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
//             expect(resForInvalidSortDirection.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
//         // SORT BY
//         const resForInvalidSortBy = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
//             expect(resForInvalidSortBy.status).toBe(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
//     })
})