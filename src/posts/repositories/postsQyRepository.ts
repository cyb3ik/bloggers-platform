import { ObjectId, WithId } from "mongodb"
import { PaginationPostQuery, RawPost } from "../models/postTypes"
import { postsCollection } from "../../db/mongo.db"
import { NotFoundError } from "../../core/errors/not-found-error"

export const postsQyRepository = {
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
        
    async findPostById(id: string): Promise<WithId<RawPost>> {
        const result = await postsCollection.findOne( { _id: new ObjectId(id) } )
    
        if (!result) {
            throw new NotFoundError('Post not found')
        }
    
        return result
    },
        
    async findBlogPosts(id: string, query: PaginationPostQuery): Promise<{ 
        totalCount: number, 
        items: WithId<RawPost>[] }> {
            const { pageNumber, pageSize, sortBy, sortDirection } = query

            const skip = Math.ceil((pageNumber - 1) * pageSize)

            const limit = pageSize

            const items = await postsCollection
                .find({ blogId: id })
                .sort( { [sortBy]: sortDirection} )
                .skip(skip)
                .limit(limit)
                .toArray()
            const totalCount = await postsCollection.countDocuments({ blogId: id })

            return { totalCount: totalCount, items: items } 
    }
}