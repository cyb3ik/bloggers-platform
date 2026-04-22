import { WithId } from "mongodb"
import { PaginationCommentQuery, RawComment } from "../models/commentTypes"
import { commentsQyRepository } from "../repositories/commentsQyRepository"
import { postsQyRepository } from "../../posts/repositories/postsQyRepository"

export const commentsQueryService = {

    async findCommentById(id: string): Promise<WithId<RawComment>> {
        return commentsQyRepository.findCommentById(id)
    },

    async findPostComments(postId: string, query: PaginationCommentQuery): Promise<{totalCount: number, items: WithId<RawComment>[]}> {
        const foundPost = await postsQyRepository.findPostById(postId)

        return await commentsQyRepository.findPostComments(String(foundPost._id), query)
    }
}