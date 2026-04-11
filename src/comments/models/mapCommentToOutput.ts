import { WithId } from "mongodb"
import { CommentOutputModel, RawComment } from "./commentTypes"

export const mapCommentToOutput = (dto: WithId<RawComment>): CommentOutputModel => {
    return {
        id: dto._id.toString(),
        content: dto.content,
        commentatorInfo: dto.commentatorInfo,
        createdAt: dto.createdAt
    }
}