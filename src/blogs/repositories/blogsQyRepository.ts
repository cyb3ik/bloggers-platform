import { ObjectId, WithId } from "mongodb"
import { PaginationBlogQuery, RawBlog } from "../models/blogTypes"
import { blogsCollection } from "../../db/mongo.db"
import { NotFoundError } from "../../core/errors/not-found-error"

export const blogsQyRepository = {
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

    async findBlogById(id: string): Promise<WithId<RawBlog>> {
        const result = await blogsCollection.findOne( { _id: new ObjectId(id) })

        if (!result) {
            throw new NotFoundError('Blog not found')
        }

        return result
    }
}