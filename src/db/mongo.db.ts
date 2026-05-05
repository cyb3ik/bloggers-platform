import { Collection, Db, MongoClient } from 'mongodb'
import { RawBlog } from '../blogs/models/blogTypes'
import { RawPost } from '../posts/models/postTypes'
import { RawUser } from '../users/models/userTypes'
import { RawComment } from '../comments/models/commentTypes'
import { DB_NAME } from '../core/settings/config'
import { Req } from '../core/requests/types/requestTypes'

export let client: MongoClient
export let postsCollection: Collection<RawPost>
export let blogsCollection: Collection<RawBlog>
export let usersCollection: Collection<RawUser>
export let commentsCollection: Collection<RawComment>
export let requestsCollection: Collection<Req>

const POSTS_COLLECTION_NAME = 'posts'
const BLOGS_COLLECTION_NAME = 'blogs'
const USERS_COLLECTION_NAME = 'users'
const COMMENTS_COLLECTION_NAME = 'comments'
const REQUESTS_COLLECTION_NAME = 'requests'
 
export async function runDB(url: string, dbName = DB_NAME): Promise<void> {

    client = new MongoClient(url)
    const db: Db = client.db(dbName)
    
    postsCollection = db.collection<RawPost>(POSTS_COLLECTION_NAME)
    blogsCollection = db.collection<RawBlog>(BLOGS_COLLECTION_NAME)
    usersCollection = db.collection<RawUser>(USERS_COLLECTION_NAME)
    commentsCollection = db.collection<RawComment>(COMMENTS_COLLECTION_NAME)
    requestsCollection = db.collection<Req>(REQUESTS_COLLECTION_NAME)
    
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

export async function stopDb() {
  if (!client) {
    throw new Error('No active client');
  }
  await client.close();
}