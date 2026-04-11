import { WithId } from "mongodb";
import { CommentInputModel, RawComment } from "../models/commentTypes";
import { commentsRepository } from "../repositories/commentsRepository";
import { RawUser } from "../../users/models/userTypes";

export const commentsService = {

    async create(postId: string, user: WithId<RawUser>, body: CommentInputModel): Promise<string> {

        const newComment: RawComment = {
            content: body.content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
            postId: postId
        }

        return await commentsRepository.createComment(newComment)
    },

    async update(id: string, body: CommentInputModel): Promise<void> {
        return await commentsRepository.updateComment(id, body)
    },

    async delete(id: string): Promise<void> {
        return await commentsRepository.deleteComment(id)
    }
}