import request from 'supertest'
import express from 'express'
import { BlogInputModel, BlogPostInputModel } from '../../../blogs/models/blogTypes'
import { adminPass, adminUserName, BLOGS_PATH, mongoUrl, POSTS_PATH, TESTING_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { reallyLongDesc } from '../utils/validation-strings'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'

describe('Blogs API body/params/query validation', () => {
    const app = express()
    testingSetup(app)
    
    const blogsTestManager = new TestManager(app, BLOGS_PATH)

    const validBlogInput: BlogInputModel = {
        name: 'BlogName',
        description: 'some desc',
        websiteUrl: 'https://google.com'
    }

    const validBlogPostInput: BlogPostInputModel = {
            title: 'lolol',
            shortDescription: 'lolol',
            content: 'lolol'
        }

    const credentials = `${adminUserName}:${adminPass}`
    const basicToken = 'Basic ' + Buffer.from(credentials).toString('base64')

    let validBlogId: string

    beforeAll(async () => {
        await runDB(mongoUrl!, 'bloggers-platform-test')
        await request(app)
            .delete(TESTING_PATH + '/all-data')
            .expect(HTTPStatusCode.NO_CONTENT)

        const createdBlog = await request(app)
            .post(BLOGS_PATH)
            .set('Authorization', basicToken)
            .send(validBlogInput)
            .expect(HTTPStatusCode.CREATED)

        validBlogId = createdBlog.body.id
    })

    afterAll(async () => {
        await stopDb()
    })

    it(`should not return error if ID in params is valid; 
        GET /api/blogs/:id; 
        GET /api/blogs/:blogId/posts; 
        POST /api/blogs/:blogId/posts
        PUT /api/blogs/:id;
        DELETE /api/blogs/:id`, async () => {

        // GET blog by id
        await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.OK,
            `/${validBlogId}`
        )
        
        // GET posts from blog by id
        await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.OK,
            `/${validBlogId}` + '/posts'
        )
        
        // POST post in blog
        await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            HTTPStatusCode.CREATED,
            `/${validBlogId}` + '/posts'
        )

        // PUT in blog by id
        await blogsTestManager.updateEntity(
            validBlogInput,
            basicToken,
            HTTPStatusCode.NO_CONTENT,
            `/${validBlogId}`
        )

        // DELETE blog by id
        await blogsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.NO_CONTENT,
            `/${validBlogId}`
        )
    })

    it(`should return error if ID in params is invalid; 
        GET /api/blogs/:id; 
        GET /api/blogs/:blogId/posts; 
        POST /api/blogs/:blogId/posts
        PUT /api/blogs/:id;
        DELETE /api/blogs/:id`, async () => {
        
        const invalidTypeId = {}
        const invalidFormatId = '123'
        
        // GET blog by id
        const resForInvalidInput1 = await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput1.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput2 = await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput2.body.errorsMessages[0].field).toEqual('id')
        
        // GET posts from blog by id
        const resForInvalidInput3 = await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}` + '/posts')
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('blogId')

        const resForInvalidInput4 = await blogsTestManager.findEntity(
            null,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}` + '/posts')
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('blogId')
        
        // POST post in blog
        const resForInvalidInput5 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}` + '/posts')
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('blogId')

        const resForInvalidInput6 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${invalidFormatId}` + '/posts')
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('blogId')

        // PUT in blog by id
        const resForInvalidInput7 = await blogsTestManager.updateEntity(
            validBlogInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput8 = await blogsTestManager.updateEntity(
            validBlogInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)

        expect(resForInvalidInput8.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput8.body.errorsMessages[0].field).toEqual('id')

        // DELETE blog by id
        const resForInvalidInput9 = await blogsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidTypeId}`)
        expect(resForInvalidInput9.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput9.body.errorsMessages[0].field).toEqual('id')

        const resForInvalidInput10 = await blogsTestManager.deleteEntity(
            basicToken,
            HTTPStatusCode.BAD_REQUEST, 
            `/${invalidFormatId}`)
        expect(resForInvalidInput10.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput10.body.errorsMessages[0].field).toEqual('id')
    })

    it('should not create blog with invalid input body; POST /api/blogs', async () =>{

        const invalidTypeInput = {
            name: 123,
            description: 123,
            websiteUrl: 123
        }
        
        const resForInvalidInput1 = await blogsTestManager.createEntity(
            invalidTypeInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            name: '  ',
            description: '  ', // it can be empty
            websiteUrl: '  '
        }

        const resForInvalidInput2 = await blogsTestManager.createEntity(
            emptyInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(2)

        const emptyNameInput = {
            name: '  ',
            description: 'lol',
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput3 = await blogsTestManager.createEntity(
            emptyNameInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('name')

        const emptyWebsiteInput = {
            name: 'Sergey',
            description: 'lol',
            websiteUrl: '  '
        }

        const resForInvalidInput4 = await blogsTestManager.createEntity(
            emptyWebsiteInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('websiteUrl')

        const wrongUrlInput = {
            name: 'Sergey',
            description: 'lol',
            websiteUrl: 'https://googlecom'
        }

        const resForInvalidInput5 = await blogsTestManager.createEntity(
            wrongUrlInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('websiteUrl')

        const longNameInput = {
            name: 'Aleksander The Third',
            description: 'lol',
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput6 = await blogsTestManager.createEntity(
            longNameInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('name')

        const longDescInput = {
            name: 'Alex',
            description: reallyLongDesc,
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput7 = await blogsTestManager.createEntity(
            longDescInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST
        )
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('description')
    })

    it('should not update blog with invalid input data; PUT /api/blogs/:id', async () => {
        const invalidTypeInput = {
            name: 123,
            description: 123,
            websiteUrl: 123
        }
        
        const resForInvalidInput1 = await blogsTestManager.updateEntity(
            invalidTypeInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput1.body.errorsMessages).toHaveLength(3)

        const emptyInput = {
            name: '  ',
            description: '  ', // it can be empty
            websiteUrl: '  '
        }

        const resForInvalidInput2 = await blogsTestManager.updateEntity(
            emptyInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput2.body.errorsMessages).toHaveLength(2)

        const emptyNameInput = {
            name: '  ',
            description: 'lol',
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput3 = await blogsTestManager.updateEntity(
            emptyNameInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput3.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput3.body.errorsMessages[0].field).toEqual('name')

        const emptyWebsiteInput = {
            name: 'Sergey',
            description: 'lol',
            websiteUrl: '  '
        }

        const resForInvalidInput4 = await blogsTestManager.updateEntity(
            emptyWebsiteInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput4.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput4.body.errorsMessages[0].field).toEqual('websiteUrl')

        const wrongUrlInput = {
            name: 'Sergey',
            description: 'lol',
            websiteUrl: 'https://googlecom'
        }

        const resForInvalidInput5 = await blogsTestManager.updateEntity(
            wrongUrlInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput5.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput5.body.errorsMessages[0].field).toEqual('websiteUrl')

        const longNameInput = {
            name: 'Aleksander The Third',
            description: 'lol',
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput6 = await blogsTestManager.updateEntity(
            longNameInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput6.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput6.body.errorsMessages[0].field).toEqual('name')

        const longDescInput = {
            name: 'Alex',
            description: reallyLongDesc,
            websiteUrl: 'https://google.com'
        }

        const resForInvalidInput7 = await blogsTestManager.updateEntity(
            longDescInput,
            basicToken,
            HTTPStatusCode.BAD_REQUEST,
            `/${validBlogId}`
        )
        expect(resForInvalidInput7.body.errorsMessages).toHaveLength(1)
        expect(resForInvalidInput7.body.errorsMessages[0].field).toEqual('description')
    })

    // it('should return errors if query pagination params is invalid; GET /api/blogs', async () => {

    //     const createdBlog = await request(app)
    //         .post(BLOGS_PATH)
    //         .set('Authorization', token)
    //         .send(validBlogInput)
    //         .expect(HTTPStatusCode.CREATED) 
        
    //     const resForDefaultPagination = await request(app)
    //         .get(BLOGS_PATH)
    //         .expect(HTTPStatusCode.OK)

    //     expect(resForDefaultPagination.body.page).toBe(1)
    //     expect(resForDefaultPagination.body.pageSize).toBe(10)
    //     expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
    //     expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

    //     const resForValidPagination = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=1&pageNumber=2')
    //         .expect(HTTPStatusCode.OK)

    //     expect(resForValidPagination.body.page).toBe(2)
    //     expect(resForValidPagination.body.pageSize).toBe(1)
    //     expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
    //     expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
    //     // PAGE SIZE
    //     const resForInvalidPageSize1 = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageSize2 = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageSize3 = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

    //     // PAGE NUMBER
    //     const resForInvalidPageNumber1 = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageNumber2 = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

    //     // SORT DIRECTION
    //     const resForInvalidSortDirection = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
    //     // SORT BY
    //     const resForInvalidSortBy = await request(app)
    //         .get(BLOGS_PATH + '?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
    // })

    // it('should return errors if query pagination params is invalid; GET /api/blogs/:blogId/posts', async () => {

    //     const createdBlog = await request(app)
    //         .post(BLOGS_PATH)
    //         .set('Authorization', token)
    //         .send(validBlogInput)
    //         .expect(HTTPStatusCode.CREATED) 
        
    //     const resForDefaultPagination = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts')
    //         .expect(HTTPStatusCode.OK)

    //     expect(resForDefaultPagination.body.page).toBe(1)
    //     expect(resForDefaultPagination.body.pageSize).toBe(10)
    //     expect(resForDefaultPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
    //     expect(resForDefaultPagination.body.totalCount).toBeGreaterThanOrEqual(0)

    //     const resForValidPagination = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=1&pageNumber=2')
    //         .expect(HTTPStatusCode.OK)

    //     expect(resForValidPagination.body.page).toBe(2)
    //     expect(resForValidPagination.body.pageSize).toBe(1)
    //     expect(resForValidPagination.body.pagesCount).toBeGreaterThanOrEqual(0)
    //     expect(resForValidPagination.body.totalCount).toBeGreaterThanOrEqual(0)
        
    //     // PAGE SIZE
    //     const resForInvalidPageSize1 = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=0&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize1.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageSize2 = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=101&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize2.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageSize3 = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=abc&pageNumber=1&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageSize3.body.errorsMessages).toHaveLength(1)

    //     // PAGE NUMBER
    //     const resForInvalidPageNumber1 = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=10&pageNumber=0&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageNumber1.body.errorsMessages).toHaveLength(1)

    //     const resForInvalidPageNumber2 = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=10&pageNumber=abc&sortDirection=asc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidPageNumber2.body.errorsMessages).toHaveLength(1)

    //     // SORT DIRECTION
    //     const resForInvalidSortDirection = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=10&pageNumber=1&sortDirection=abc&sortBy=id')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidSortDirection.body.errorsMessages).toHaveLength(1)
        
    //     // SORT BY
    //     const resForInvalidSortBy = await request(app)
    //         .get(BLOGS_PATH + `/${createdBlog.body.id}` + '/posts?pageSize=10&pageNumber=1&sortDirection=asc&sortBy=i')
    //         .expect(HTTPStatusCode.BAD_REQUEST)
        
    //     expect(resForInvalidSortBy.body.errorsMessages).toHaveLength(1)
    // })
})