import { WithId } from "mongodb"
import { CommentOutputModel, RawComment } from "./commentTypes"
import { LikeStatus } from "../../likes/models/likes-types"

export const mapCommentToOutput = (dto: WithId<RawComment>, status: LikeStatus): CommentOutputModel => {
    return {
        id: dto._id.toString(),
        content: dto.content,
        commentatorInfo: dto.commentatorInfo,
        createdAt: dto.createdAt,
        likesInfo: {
            likesCount: dto.likesInfo.likesCount,
            dislikesCount: dto.likesInfo.dislikesCount,
            myStatus: status
        }
    }
}