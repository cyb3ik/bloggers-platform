import { WithId } from "mongodb";
import { CommentInputModel, RawComment } from "../models/commentTypes";
import { commentsRepository } from "../repositories/commentsRepository";
import { RawUser } from "../../users/models/userTypes";
import { LikeStatus } from "../../likes/models/likes-types";

export const commentsService = {

    async createComment(postId: string, user: WithId<RawUser>, body: CommentInputModel): Promise<string> {

        const newComment: RawComment = {
            content: body.content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
            postId: postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0
            }
        }

        return await commentsRepository.createComment(newComment)
    },

    async updateCommentById(id: string, body: CommentInputModel): Promise<void> {
        return await commentsRepository.updateCommentById(id, body)
    },

    async deleteCommentById(id: string): Promise<void> {
        return await commentsRepository.deleteCommentById(id)
    },

    async updateLikesAndDislikesCount(commentId: string, likesAmount: number, dislikesAmount: number): Promise<void> {
        return await commentsRepository.updateLikesAndDislikesCount(commentId, likesAmount, dislikesAmount)
    }
}