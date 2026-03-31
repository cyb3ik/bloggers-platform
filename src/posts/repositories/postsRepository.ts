import { PaginationPostQuery, PostInputModel } from "../models/postTypes"
import { RawPost } from "../models/postTypes"
import { postsCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"

export const postsRepository = {

    async findAllPosts(query: PaginationPostQuery): Promise<{ 
            totalCount: number, 
            items: WithId<RawPost>[] }> {
                const {pageNumber, pageSize, sortBy, sortDirection } = query
    
                const skip = Math.ceil((pageNumber - 1) * pageSize)
    
                const limit = pageSize
    
                const items = await postsCollection
                    .find({})
                    .sort( {[sortBy]: sortDirection} )
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                const totalCount = await postsCollection.countDocuments({})
    
                return {totalCount: totalCount, items: items}
        },
    
    async findPost(id: string): Promise<WithId<RawPost>> {
        const result = await postsCollection.findOne( { _id: new ObjectId(id) } )

        if (!result) {
            throw new NotFoundError('Post not found')
        }

        return result
    },

    async createPost(dto: RawPost): Promise<string> {
        const insertedResult = await postsCollection.insertOne(dto)

        return insertedResult.insertedId.toString()
    },

    async updatePost(id: string, body: PostInputModel): Promise<void> {
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

    async deletePost(id: string): Promise<void> {
        const deleteResult = await postsCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('Post not found')
        }

        return
    }
}