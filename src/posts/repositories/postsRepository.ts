import { PostInputModel } from "../models/postTypes"
import { RawPost } from "../models/postTypes"
import { postsCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"

export const postsRepository = {

    async createPost(dto: RawPost): Promise<string> {
        const insertedResult = await postsCollection.insertOne(dto)

        return insertedResult.insertedId.toString()
    },

    async findPostById(id: string): Promise<WithId<RawPost>> {
        const foundPost = await postsCollection.findOne( {_id: new ObjectId(id)} )

        if (!foundPost) {
            throw new NotFoundError('Post not found')
        }

        return foundPost
    },

    async updatePostById(id: string, body: PostInputModel): Promise<void> {
        const updateResult = await postsCollection.updateOne( 
            { _id: new ObjectId(id) },
            { 
                $set: {
                    shortDescription: body.shortDescription,
                    content: body.content,
                    blogId: body.blogId,
                    title: body.title
                }
            }
        )
        
        if (updateResult.matchedCount < 1) {
            throw new NotFoundError('Post not found')
        }

        return
    },

    async deletePostById(id: string): Promise<void> {
        const deleteResult = await postsCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('Post not found')
        }

        return
    }
}