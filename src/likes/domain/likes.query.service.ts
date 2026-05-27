import { likesQyRepository } from "../repositories/likesQyRepository"
import { LikeStatus, RawLike } from "../models/likes-types"
import { WithId } from "mongodb"

export const likesQueryService = {

    async getUserStatus(entityId: string, userId: string): Promise<LikeStatus | null> {
        const status = await likesQyRepository.getUserStatusFromEntity(entityId, userId)

        return status
    },

    async getAllEntityLikesWithStatus(entityId: string, status: LikeStatus): Promise<WithId<RawLike>[]> {
        const likes = await likesQyRepository.getAllEntityLikesWithStatus(entityId, status)

        return likes
    }
}