import { PaginationPostQuery, PostInputModel, RawPost } from "../models/postTypes";
import { WithId } from "mongodb";
import { postsQyRepository } from "../repositories/postsQyRepository";
import { PaginationCommentQuery, RawComment } from "../../comments/models/commentTypes";
import { commentsQyRepository } from "../../comments/repositories/commentsQyRepository";

export const postsQueryService = {
    async findAllPosts(query: PaginationPostQuery): Promise<{totalCount: number, items: WithId<RawPost>[]}> {
        return postsQyRepository.findAllPosts(query)
    },

    async findPostComments(postId: string, query: PaginationCommentQuery): Promise<{totalCount: number, items: WithId<RawComment>[]}> {
        const foundPost = await postsQyRepository.findPostById(postId)

        return await commentsQyRepository.findPostComments(String(foundPost._id), query)
    },

    async findPostById(id: string): Promise<WithId<RawPost>> {
        return postsQyRepository.findPostById(id)
    }
}