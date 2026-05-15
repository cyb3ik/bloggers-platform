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

describe('Posts API body/params/query validation', () => {
    const app = express()
    testingSetup(app)

    const postsTestManager = new TestManager(app, POSTS_PATH)
    const blogsTestManager = new TestManager(app, BLOGS_PATH)
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

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        await request(app)
            .delete(TESTING_PATH + '/all-data')
            .expect(HTTPStatusCode.NO_CONTENT)
        
        // creating blog for further usage of its id
        const createdBlog = await blogsTestManager.createEntity(
            validBlogInput, 
            basicToken,
            HTTPStatusCode.CREATED)

        validBlogId = createdBlog.body.id

        // creating user for further usage of his access token
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
            basicToken,
            HTTPStatusCode.CREATED) 

        const validPostId = createdPost.body.id
        
        // GET post by id
        await postsTestManager.findEntity(
            null,
            HTTPStatusCode.OK, 
            `/${validPostId}`)
        
        // GET comments from post by id
        await postsTestManager.findEntity(
            null,
            HTTPStatusCode.OK, 
            `/${validPostId}` + '/comments')
        
        // POST comment in post
        await postsTestManager.createEntity(
            validPostCommentInput, 
            accessToken,
            HTTPStatusCode.CREATED, 
            `/${createdPost.body.id}` + '/comments')

        // PUT in post by id
        await postsTestManager.updateEntity(
            validPostInput, 
            basicToken,
            HTTPStatusCode.NO_CONTENT, 
            `/${validPostId}`)

        // DELETE post by id
        await postsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.NO_CONTENT, 
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput2 = await postsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('id')
        
        // GET comments from post by id
        const resForInvalidInput3 = await postsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}` + '/comments')
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('postId')

        const resForInvalidInput4 = await postsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}` + '/comments')
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('postId')
        
        // POST comment in post
        const resForInvalidInput5 = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}` + '/comments')
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('postId')

        const resForInvalidInput6 = await postsTestManager.createEntity(
            validPostCommentInput,
            accessToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${invalidFormatId}` + '/comments')
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('postId')

        // PUT in post by id
        const resForInvalidInput7 = await postsTestManager.updateEntity(
            validPostInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput8 = await postsTestManager.updateEntity(
            validPostInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)

        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('id')

        // DELETE post by id
        const resForInvalidInput9 = await postsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput10 = await postsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(4)

        const emptyInput = {
            title: '  ',
            shortDescription: '  ',
            content: '  ',
            blogId: validBlogId
        }

        const resForInvalidInput2 = await postsTestManager.createEntity(
            emptyInput, 
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const emptyTitleInput = {
            title: '  ',
            shortDescription: 'some desc',
            content: 'some content',
            blogId: validBlogId
        }

        const resForInvalidInput3 = await postsTestManager.createEntity(
            emptyTitleInput, 
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            basicToken,
            HTTPStatusCode.BAD_REQUEST)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            title: '  ',
            shortDescription: '  ',
            content: '  '
        }

        const resForInvalidInput2 = await blogsTestManager.createEntity(
            emptyInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(3)

        const emptyTitleInput = {
            title: '  ',
            shortDescription: 'lolol',
            content: 'lolol'
        }

        const resForInvalidInput3 = await blogsTestManager.createEntity(
            emptyTitleInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}` + '/posts'
        )
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
            basicToken,
            HTTPStatusCode.CREATED)

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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
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
            HTTPStatusCode.BAD_REQUEST,
            `/${validPostId}`)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('blogId')
    })

//     it('should return errors if query pagination params is invalid; GET /api/posts', async () => {
        
//         const resForDefaultPagination = await request(app)
//             .get(POSTS_PATH)
//             .expect(HTTPStatusCode.OK)

//         expect(resForDefaultPagination.body.page).toBe(1)
//         expect(resForDefaultPagination.body.pageSize).toBe(10)
//         expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

//         const resForValidPagination = await request(app)
//             .get(POSTS_PATH + '?pageSize=1&pageNumber=2')
//             .expect(HTTPStatusCode.OK)

//         expect(resForValidPagination.body.page).toBe(2)
//         expect(resForValidPagination.body.pageSize).toBe(1)
//         expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
//         // PAGE SIZE
//         const resForInvalidPageSize1 = await request(app)
//             .get(POSTS_PATH + '?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize2 = await request(app)
//             .get(POSTS_PATH + '?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize3 = await request(app)
//             .get(POSTS_PATH + '?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

//         // PAGE NUMBER
//         const resForInvalidPageNumber1 = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageNumber2 = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

//         // SORT DIRECTION
//         const resForInvalidSortDirection = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
//         // SORT BY
//         const resForInvalidSortBy = await request(app)
//             .get(POSTS_PATH + '?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
//     })

//     it('should return errors if query pagination params is invalid; GET /api/posts/:postId/comments', async () => {

//         const createdBlog = await request(app)
//             .post(BLOGS_PATH)
//             .set('Authorization', token)
//             .send(validBlogInput)
//             .expect(HTTPStatusCode.CREATED)
        
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
//             .expect(HTTPStatusCode.CREATED)
        
//         const resForDefaultPagination = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments')
//             .expect(HTTPStatusCode.OK)

//         expect(resForDefaultPagination.body.page).toBe(1)
//         expect(resForDefaultPagination.body.pageSize).toBe(10)
//         expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

//         const resForValidPagination = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=1&pageNumber=2')
//             .expect(HTTPStatusCode.OK)

//         expect(resForValidPagination.body.page).toBe(2)
//         expect(resForValidPagination.body.pageSize).toBe(1)
//         expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
//         expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
//         // PAGE SIZE
//         const resForInvalidPageSize1 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize2 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageSize3 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

//         // PAGE NUMBER
//         const resForInvalidPageNumber1 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

//         const resForInvalidPageNumber2 = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

//         // SORT DIRECTION
//         const resForInvalidSortDirection = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
//         // SORT BY
//         const resForInvalidSortBy = await request(app)
//             .get(POSTS_PATH + `/${createdPost.body.id}` + '/comments?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
//             .expect(HTTPStatusCode.BAD_REQUEST)
        
//         expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
//     })
})