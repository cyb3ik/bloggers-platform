import * as dotenv from 'dotenv'
dotenv.config()

export const TESTING_PATH = '/bloggers-platform/api/testing'
export const BLOGS_PATH = '/bloggers-platform/api/blogs'
export const POSTS_PATH = '/bloggers-platform/api/posts'
export const USERS_PATH = '/bloggers-platform/api/users'
export const COMMENTS_PATH = '/bloggers-platform/api/comments'
export const AUTH_PATH = '/bloggers-platform/api/auth'


export const mongoUrl = process.env.MONGO_URL
export const DB_NAME = process.env.DB_NAME

export const PORT = process.env.PORT

export const adminUserName = process.env.ADMIN_USERNAME
export const adminPass = process.env.ADMIN_PASSWORD

export const JWT_ACCESS_SECRET = process.env.JWT_SECRET

export const JWT_REFRESH_SECRET = process.env.JWT_SECRET

export const EMAIL = process.env.EMAIL
export const EMAIL_PASS = process.env.EMAIL_PASS