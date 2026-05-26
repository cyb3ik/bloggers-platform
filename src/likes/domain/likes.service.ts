import { LikeInputModel, LikeStatus, RawLike } from "../models/likes-types";
import { likesRepository } from "../repositories/likesRepository";

export const likesService = {

    async addLike(userId: string, entityId: string, status: LikeStatus): Promise<void> {

        const newLike: RawLike = {
            createdAt: new Date().toISOString(),
            status: status,
            userId: userId,
            entityId: entityId
        }

        return await likesRepository.createLike(newLike)
    },

    async updateLikeStatus(userId: string, entityId: string, status: LikeStatus): Promise<void> {
        return await likesRepository.updateLikeStatus(userId, entityId, status)
    }
}