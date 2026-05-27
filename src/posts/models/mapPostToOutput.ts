import { WithId } from "mongodb"
import { RawPost, PostOutputModel } from "./postTypes"
import { LikeStatus, LikeViewModel } from "../../likes/models/likes-types"

export const mapPostToOutput = (dto: WithId<RawPost>, status: LikeStatus, newestLikes: LikeViewModel[]): PostOutputModel => {
    return {
        id: dto._id.toString(),
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: dto.blogName,
        createdAt: dto.createdAt,
        extendedLikesInfo: {
            likesCount: dto.extendedLikesInfo.likesCount,
            dislikesCount: dto.extendedLikesInfo.dislikesCount,
            myStatus: status,
            newestLikes: newestLikes
        }
    }
}