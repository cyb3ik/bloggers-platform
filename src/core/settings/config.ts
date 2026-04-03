import * as dotenv from 'dotenv'
dotenv.config()

export const TESTING_PATH = '/bloggers-platform/api/testing'
export const BLOGS_PATH = '/bloggers-platform/api/blogs'
export const POSTS_PATH = '/bloggers-platform/api/posts'
export const USERS_PATH = '/bloggers-platform/api/users'
export const AUTH_PATH = '/bloggers-platform/api/auth'

export const mongoUrl = process.env.MONGO_URL

export const PORT = process.env.PORT || 5002

export const adminUserName = process.env.ADMIN_USERNAME || 'admin'
export const adminPass = process.env.ADMIN_PASSWORD || 'qwerty'