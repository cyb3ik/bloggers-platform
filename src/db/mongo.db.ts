import { Collection, Db, MongoClient } from 'mongodb'
import { RawBlog } from '../blogs/models/blogTypes'
import { RawPost } from '../posts/models/postTypes'
import { RawUser } from '../users/models/userTypes'
import { RawComment } from '../comments/models/commentTypes'

export let client: MongoClient
export let postsCollection: Collection<RawPost>
export let blogsCollection: Collection<RawBlog>
export let usersCollection: Collection<RawUser>
export let commentsCollection: Collection<RawComment>

const DB_NAME = 'bloggers-platform'
const POSTS_COLLECTION_NAME = 'posts'
const BLOGS_COLLECTION_NAME = 'blogs'
const USERS_COLLECTION_NAME = 'users'
const COMMENTS_COLLECTION_NAME = 'comments'
 
export async function runDB(url: string): Promise<void> {

    client = new MongoClient(url)
    const db: Db = client.db(process.env.DB_NAME || DB_NAME)
    
    postsCollection = db.collection<RawPost>(POSTS_COLLECTION_NAME)
    blogsCollection = db.collection<RawBlog>(BLOGS_COLLECTION_NAME)
    usersCollection = db.collection<RawUser>(USERS_COLLECTION_NAME)
    commentsCollection = db.collection<RawComment>(COMMENTS_COLLECTION_NAME)
    
    try {
        await client.connect()
        await db.command({ ping: 1 })
        console.log('Connected to database')
    } 
    catch (e) {
        await client.close()
        throw new Error(`Cannot connect to database: ${e}`)
    }
}