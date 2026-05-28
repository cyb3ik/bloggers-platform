import request from 'supertest'
import express from 'express'
import { BLOGS_PATH, mongoUrl, TESTING_PATH, USERS_PATH } from '../../../core/settings/config'
import { runDB, stopDb } from '../../../db/mongo.db'
import { HTTPStatusCode } from '../../../core/utils/status-codes'
import { UserInputModel, UserOutputModel } from '../../../users/models/userTypes'
import { TestManager } from '../utils/test-manager'
import { testingSetup } from '../../../testing/testing-setup-app'
import { basicToken, dateRegExp, invalidToken, validBlogInput, validBlogPostInput, validUserInput1} from '../utils/fixtures'
import { ObjectId } from 'mongodb'
import { Http2ServerRequest } from 'node:http2'
import { BlogInputModel, BlogOutputModel } from '../../../blogs/models/blogTypes'
import { PostOutputModel } from '../../../posts/models/postTypes'
import { LikeStatus } from '../../../likes/models/likes-types'


describe('Blogs API endpoints tests', () => {
    const app = express()
    testingSetup(app)

    const usersTestManager = new TestManager(app, USERS_PATH)
    const blogsTestManager = new TestManager(app, BLOGS_PATH)

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
        POST /api/blogs
        POST /api/:blogId/posts
        PUT /api/:blogId
        DELETE /api/:blogId`, async () => {

        const resForCreatedBlog = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken
        )

        const createdBlog = resForCreatedBlog.body
        
        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            invalidToken
        )

        const res1 = await blogsTestManager.createEntity(
            validBlogInput,
            ''
        )

        expect(res0.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res1.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res2 = await blogsTestManager.createEntity(
            validUserInput1,
            invalidToken,
            `/${createdBlog.id}/posts`
        )

        const res3 = await blogsTestManager.createEntity(
            validUserInput1,
            '',
            `/${createdBlog.id}/posts`
        )

        expect(res2.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res3.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res4 = await blogsTestManager.updateEntity(
            validBlogInput,
            invalidToken,
            `/${createdBlog.id}`
        )

        const res5 = await blogsTestManager.updateEntity(
            validBlogInput,
            '',
            `/${createdBlog.id}`
        )

        expect(res4.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res5.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res6 = await blogsTestManager.deleteEntity(
            invalidToken,
            `/${createdBlog.id}`
        )

        const res7 = await blogsTestManager.deleteEntity(
            '',
            `/${createdBlog.id}`
        )

        expect(res6.status).toBe(HTTPStatusCode.UNAUTHORIZED)
        expect(res7.status).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    it(`should return not found when trying to reach not existent blog
        GET /api/blogs/:blogId
        GET /api/:blogId/posts
        POST /api/:blogId/posts
        PUT /api/:blogId
        DELETE /api/:blogId`, async () => {
        
        const res0 = await blogsTestManager.findEntity(
            null,
            `/${new ObjectId()}`
        )
        expect(res0.status).toBe(HTTPStatusCode.NOT_FOUND)

        const res1 = await blogsTestManager.findEntity(
            null,
            `/${new ObjectId()}/posts`
        )
        expect(res1.status).toBe(HTTPStatusCode.NOT_FOUND)

        const res2 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            `/${new ObjectId()}/posts`
        )
        expect(res2.status).toBe(HTTPStatusCode.NOT_FOUND)

        const res3 = await blogsTestManager.updateEntity(
            validBlogInput,
            basicToken,
            `/${new ObjectId()}`
        )
        expect(res3.status).toBe(HTTPStatusCode.NOT_FOUND)

        const res4 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${new ObjectId()}`
        )
        expect(res4.status).toBe(HTTPStatusCode.NOT_FOUND)
    })

    it(`should return correct list of all blogs after some was created or deleted
        GET /api/blogs
        additional methods: 
        POST /api/blogs
        DELETE /api/blogs/:blogId`, async () => {

        const res0 = await blogsTestManager.findEntity(
            null
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const blogsList0 = res0.body.items

        expect(blogsList0).toBeInstanceOf(Array)
        expect(blogsList0).toHaveLength(0)

        const res1 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const blogBody1 = res1.body

        const res2 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res2.status).toBe(HTTPStatusCode.CREATED)

        const blogBody2 = res2.body

        const res3 = await blogsTestManager.findEntity(
            null
        )
        expect(res3.status).toBe(HTTPStatusCode.OK)

        const blogsList1 = res3.body.items

        expect(blogsList1).toBeInstanceOf(Array)
        expect(blogsList1).toHaveLength(2)

        expect(blogsList1).toContainEqual(blogBody1)
        expect(blogsList1).toContainEqual(blogBody2)

        const res4 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${blogBody1.id}`
        )
        expect(res4.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res5 = await blogsTestManager.findEntity(
            null
        )
        expect(res5.status).toBe(HTTPStatusCode.OK)

        const blogsList2 = res5.body.items

        expect(blogsList2).toBeInstanceOf(Array)
        expect(blogsList2).toHaveLength(1)

        expect(blogsList2).not.toContainEqual(blogBody1)
        expect(blogsList2).toContainEqual(blogBody2)

        const res6 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${blogBody2.id}`
        )
        expect(res6.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res7 = await blogsTestManager.findEntity(
            null
        )
        expect(res7.status).toBe(HTTPStatusCode.OK)

        const blogsList3 = res7.body.items

        expect(blogsList3).toBeInstanceOf(Array)
        expect(blogsList3).toHaveLength(0)
        expect(blogsList3).not.toContainEqual(blogBody1)
        expect(blogsList3).not.toContainEqual(blogBody2)
    })

    it(`should return blog by id when id of existing blog is provided / return not found after blog was deleted
        GET /api/blogs/:blogId
        additional methods:
        POST /api/blogs`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const blogBody1 = res0.body

        const res1 = await blogsTestManager.findEntity(
            null,
            `/${blogBody1.id}`
        )
        expect(res1.status).toBe(HTTPStatusCode.OK)

        expect(res1.body).toEqual(blogBody1)

        const res2 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${blogBody1.id}`
        )
        expect(res2.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res3 = await blogsTestManager.findEntity(
            null,
            `/${blogBody1.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.NOT_FOUND)
    })

    it(`should return posts from blog
        GET /api/:blogId/posts
        additional methods:
        POST /api/:blogId/posts`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const blogBody1 = res0.body

        const res1 = await blogsTestManager.findEntity(
            null,
            `/${blogBody1.id}/posts`
        )
        expect(res1.status).toBe(HTTPStatusCode.OK)

        const postsList1 = res1.body.items

        expect(postsList1).toBeInstanceOf(Array)
        expect(postsList1).toHaveLength(0)

        const res2 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            `/${blogBody1.id}/posts`
        )
        expect(res2.status).toBe(HTTPStatusCode.CREATED)

        const postBody1 = res2.body

        const res3 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            `/${blogBody1.id}/posts`
        )
        expect(res3.status).toBe(HTTPStatusCode.CREATED)

        const postBody2 = res3.body

        const res4 = await blogsTestManager.findEntity(
            null,
            `/${blogBody1.id}/posts`
        )
        expect(res4.status).toBe(HTTPStatusCode.OK)

        const postsList2 = res4.body.items

        expect(postsList2).toBeInstanceOf(Array)
        expect(postsList2).toHaveLength(2)
        expect(postsList2).toContainEqual(postBody1)
        expect(postsList2).toContainEqual(postBody2)
    })

    it(`should create blog with valid input data
        POST /api/blogs
        additional methods: 
        GET /api/blogs`, async () => {

        const res0 = await blogsTestManager.findEntity(
            null
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const blogsList0 = res0.body.items

        expect(blogsList0).toBeInstanceOf(Array)
        expect(blogsList0).toHaveLength(0)

        const res1 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogData = res1.body

        const res2 = await blogsTestManager.findEntity(
            null
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const blogsList1 = res2.body.items

        expect(blogsList1).toBeInstanceOf(Array)
        expect(blogsList1).toHaveLength(1)
        expect(blogsList1).toContainEqual(createdBlogData)

        expect(createdBlogData).toMatchObject<BlogOutputModel>({
            id: expect.any(String),
            name: validBlogInput.name,
            description: validBlogInput.description,
            websiteUrl: validBlogInput.websiteUrl,
            createdAt: expect.stringMatching(dateRegExp),
            isMembership: false
        })
    })

    it(`should not create blog with invalid input data
        POST /api/blogs
        additional methods: 
        GET /api/blogs`, async () => {

        const invalidBlogInput: BlogInputModel = {
            name: '',
            description: '',
            websiteUrl: ''
        }

        const res0 = await blogsTestManager.findEntity(
            null
        )
        expect(res0.status).toBe(HTTPStatusCode.OK)

        const blogsList0 = res0.body.items

        expect(blogsList0).toBeInstanceOf(Array)
        expect(blogsList0).toHaveLength(0)

        const res1 = await usersTestManager.createEntity(
            invalidBlogInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.BAD_REQUEST)

        const res2 = await usersTestManager.findEntity(
            basicToken
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const blogsList1 = res2.body.items

        expect(blogsList1).toBeInstanceOf(Array)
        expect(blogsList1).toHaveLength(0)
    })

    it(`should create post for blog with valid input data
        POST /api/:blogId/posts
        additional methods:
        POST /api/blogs
        GET /api/:blogId/posts`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res0.body

        const res1 = await blogsTestManager.createEntity(
            validBlogPostInput,
            basicToken,
            `/${createdBlogBody.id}/posts`)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdPostBody = res1.body

        const res2 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}/posts`
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const postsList1 = res2.body.items

        expect(postsList1).toBeInstanceOf(Array)
        expect(postsList1).toHaveLength(1)
        expect(postsList1).toContainEqual(createdPostBody)

        expect(createdPostBody).toMatchObject<PostOutputModel>({
            id: expect.any(String),
            title: validBlogPostInput.title,
            shortDescription: validBlogPostInput.shortDescription,
            content: validBlogPostInput.content,
            blogId: createdBlogBody.id,
            blogName: createdBlogBody.name,
            createdAt: expect.stringMatching(dateRegExp),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: []
            }
        })
    })

    it(`should not create post for blog with invalid input data
        POST /api/:blogId/posts
        additional methods:
        POST /api/blogs
        GET /api/:blogId/posts`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken
        )
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res0.body

        const res1 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}/posts`
        )
        expect(res1.status).toBe(HTTPStatusCode.OK)

        const postsList1 = res1.body.items

        expect(postsList1).toBeInstanceOf(Array)
        expect(postsList1).toHaveLength(0)

        const invalidBlogPostInput = {
            title: '',
            shortDescription: '',
            content: ''
        }

        const res2 = await blogsTestManager.createEntity(
            invalidBlogPostInput,
            basicToken,
            `/${createdBlogBody.id}/posts`)
        expect(res2.status).toBe(HTTPStatusCode.BAD_REQUEST)

        const res3 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}/posts`
        )
        expect(res3.status).toBe(HTTPStatusCode.OK)

        const postsList2 = res3.body.items

        expect(postsList2).toBeInstanceOf(Array)
        expect(postsList2).toHaveLength(0)
    })

    it(`should update created blog
        PUT /api/blogs/:blogId
        additional methods: 
        GET /api/blogs/:blogId
        POST /api/blogs`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res0.body

        const res2 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}`
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const blogBodyBefore = res2.body

        expect(blogBodyBefore).toEqual(createdBlogBody)

        const updateBlogInput = {
            name: 'NewName',
            description: 'new desc',
            websiteUrl: 'https://newgoogle.com'
        }

        const res3 = await blogsTestManager.updateEntity(
            updateBlogInput,
            basicToken,
            `/${createdBlogBody.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res4 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}`
        )
        expect(res4.status).toBe(HTTPStatusCode.OK)

        const blogBodyAfter = res4.body

        expect(blogBodyAfter).not.toEqual(blogBodyBefore)
        expect(blogBodyAfter).toEqual({
            ...blogBodyBefore,
            name: updateBlogInput.name,
            description: updateBlogInput.description,
            websiteUrl: updateBlogInput.websiteUrl
        })
    })

    it(`should not update created blog if had troubles with access
        PUT /api/blogs/:blogId
        additional methods: 
        GET /api/blogs/:blogId
        POST /api/blogs`, async () => {

        const res1 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res1.body

        const res2 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}`
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const foundBlogBody1 = res2.body

        expect(foundBlogBody1).toEqual(createdBlogBody)

        const updateBlogInput = {
            name: 'NewName',
            description: 'new desc',
            websiteUrl: 'https://newgoogle.com'
        }

        const res3 = await blogsTestManager.updateEntity(
            updateBlogInput,
            invalidToken,
            `/${createdBlogBody.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res4 = await blogsTestManager.updateEntity(
            updateBlogInput,
            basicToken,
            `/${createdBlogBody.id}lol`
        )
        expect(res4.status).toBe(HTTPStatusCode.BAD_REQUEST)

        const res5 = await blogsTestManager.findEntity(
            null,
            `/${createdBlogBody.id}`
        )
        expect(res5.status).toBe(HTTPStatusCode.OK)

        const foundBlogBody2 = res5.body
        expect(foundBlogBody2).toEqual(createdBlogBody)
    })

    it(`should delete created blog
        DELETE /api/blogs/:blogId
        additional methods: 
        GET /api/blogs/:blogId
        POST /api/blogs`, async () => {

        const res0 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res0.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res0.body

        const res2 = await blogsTestManager.findEntity(
            null
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const blogsList1 = res2.body.items

        expect(blogsList1).toHaveLength(1)
        expect(blogsList1).toContainEqual(createdBlogBody)

        const res3 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${createdBlogBody.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.NO_CONTENT)

        const res4 = await blogsTestManager.findEntity(
            null
        )
        expect(res4.status).toBe(HTTPStatusCode.OK)

        const blogsList2 = res4.body.items

        expect(blogsList2).toHaveLength(0)
        expect(blogsList2).not.toContainEqual(createdBlogBody)
    })

    it(`should not delete created blog if had troubles with access
        DELETE /api/blogs/:blogId
        additional methods: 
        GET /api/blogs
        POST /api/blogs`, async () => {

        const res1 = await blogsTestManager.createEntity(
            validBlogInput,
            basicToken)
        expect(res1.status).toBe(HTTPStatusCode.CREATED)

        const createdBlogBody = res1.body

        const res2 = await blogsTestManager.findEntity(
            null
        )
        expect(res2.status).toBe(HTTPStatusCode.OK)

        const blogsList1 = res2.body.items

        expect(blogsList1).toHaveLength(1)
        expect(blogsList1).toContainEqual(createdBlogBody)

        const res3 = await blogsTestManager.deleteEntity(
            invalidToken,
            `/${createdBlogBody.id}`
        )
        expect(res3.status).toBe(HTTPStatusCode.UNAUTHORIZED)

        const res4 = await blogsTestManager.deleteEntity(
            basicToken,
            `/${createdBlogBody.id}lol`
        )
        expect(res4.status).toBe(HTTPStatusCode.BAD_REQUEST)

        const res5 = await blogsTestManager.findEntity(
            null
        )
        expect(res5.status).toBe(HTTPStatusCode.OK)

        const blogsList2 = res5.body.items

        expect(blogsList2).toHaveLength(1)
        expect(blogsList2).toContainEqual(createdBlogBody)
    })
})
