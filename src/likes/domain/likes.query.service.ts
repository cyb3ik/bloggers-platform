import { likesQyRepository } from "../repositories/likesQyRepository"
import { LikeStatus } from "../models/likes-types"

export const likesQueryService = {

    async getUserStatus(entityId: string, userId: string): Promise<LikeStatus | null> {
        const status = await likesQyRepository.getUserStatusFromEntity(entityId, userId)

        return status
    }
}