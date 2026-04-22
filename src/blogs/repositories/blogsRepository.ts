import { blogsCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { BlogInputModel, RawBlog } from "../models/blogTypes"
import { NotFoundError } from "../../core/errors/not-found-error"

export const blogsRepository = {

    async createBlog(dto: RawBlog): Promise<string> {
        const insertedResult = await blogsCollection.insertOne(dto)
        
        return insertedResult.insertedId.toString()
    },

    async updateBlogById(id: string, body: BlogInputModel): Promise<void> {
        const updateResult = await blogsCollection.updateOne( 
            { _id: new ObjectId(id) },
            { 
                $set: {
                    name: body.name,
                    description: body.description,
                    websiteUrl: body.websiteUrl
                }
            }
        )
        
        if (updateResult.matchedCount < 1) {
            throw new NotFoundError('Blog not found')
        }
    },

    async findBlogById(id: string): Promise<WithId<RawBlog>> {
        const foundBlog = await blogsCollection.findOne( {_id: new ObjectId(id)} )

        if (!foundBlog) {
            throw new NotFoundError('Blog not found')
        }

        return foundBlog
    },

    async deleteBlogById(id: string): Promise<void> {
        const deleteResult = await blogsCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('Blog not found')
        }

        return
    }
}