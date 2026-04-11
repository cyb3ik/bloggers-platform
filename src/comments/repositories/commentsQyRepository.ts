import { ObjectId, WithId } from "mongodb"
import { commentsCollection } from "../../db/mongo.db"
import { NotFoundError } from "../../core/errors/not-found-error"
import { PaginationCommentQuery, RawComment } from "../models/commentTypes"

export const commentsQyRepository = {
    
    async findPostComments(postId: string, query: PaginationCommentQuery): Promise<{ 
            totalCount: number, 
            items: WithId<RawComment>[] }> {
                const {pageNumber, pageSize, sortBy, sortDirection } = query
    
                const skip = Math.ceil((pageNumber - 1) * pageSize)
        
                const limit = pageSize
        
                const items = await commentsCollection
                    .find( {postId: postId} )
                    .sort( {[sortBy]: sortDirection} )
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                const totalCount = await commentsCollection.countDocuments( {postId: postId} )
        
                return {totalCount: totalCount, items: items}
            },
        
    async findCommentById(id: string): Promise<WithId<RawComment>> {
        const result = await commentsCollection.findOne( { _id: new ObjectId(id) } )
    
        if (!result) {
            throw new NotFoundError('Comment not found')
        }
    
        return result
    }
}