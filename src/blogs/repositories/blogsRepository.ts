import { blogsCollection, postsCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { PaginationPostQuery, RawPost } from "../../posts/models/postTypes"
import { BlogInputModel, PaginationBlogQuery, RawBlog } from "../models/blogTypes"
import { NotFoundError } from "../../core/errors/not-found-error"

export const blogsRepository = {

    async findAllBlogs(query: PaginationBlogQuery): Promise<{ 
        totalCount: number, 
        items: WithId<RawBlog>[] }> {
            const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = query

            const skip = Math.ceil((pageNumber - 1) * pageSize)

            const limit = pageSize

            const filter: any = {}

            if (searchNameTerm) {
                filter.name = { $regex: searchNameTerm, $options: 'i'}
            }

            const items = await blogsCollection
                .find(filter)
                .sort( {[sortBy]: sortDirection} )
                .skip(skip)
                .limit(limit)
                .toArray()
            const totalCount = await blogsCollection.countDocuments(filter)

            return {totalCount: totalCount, items: items}
    },

    async findBlog(id: string): Promise<WithId<RawBlog>> {
        const result = await blogsCollection.findOne( { _id: new ObjectId(id) })

        if (!result) {
            throw new NotFoundError('Blog not found')
        }

        return result
    },

    async findBlogPosts(id: string, query: PaginationPostQuery): Promise<{ 
        totalCount: number, 
        items: WithId<RawPost>[] }> {
            const {pageNumber, pageSize, sortBy, sortDirection } = query

            const skip = Math.ceil((pageNumber - 1) * pageSize)

            const limit = pageSize

            const items = await postsCollection
                .find({blogId: id})
                .sort( {[sortBy]: sortDirection} )
                .skip(skip)
                .limit(limit)
                .toArray()
            const totalCount = await postsCollection.countDocuments({blogId: id})

            return {totalCount: totalCount, items: items}
    },

    async createBlog(dto: RawBlog): Promise<string> {
        const insertedResult = await blogsCollection.insertOne(dto)
        
        return insertedResult.insertedId.toString()
    },

    async updateBlog(id: string, body: BlogInputModel): Promise<void> {
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

    async deleteBlog(id: string): Promise<void> {
        const deleteResult = await blogsCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('Blog not found')
        }

        return
    }
}