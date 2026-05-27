import { LikeInputModel, LikeStatus, RawLike } from "../models/likes-types";
import { likesRepository } from "../repositories/likesRepository";

export const likesService = {

    async addLike(userId: string, login: string, entityId: string, status: LikeStatus): Promise<void> {

        const newLike: RawLike = {
            addedAt: new Date().toISOString(),
            status: status,
            userId: userId,
            login: login,
            entityId: entityId
        }

        return await likesRepository.createLike(newLike)
    },

    async updateLikeStatus(userId: string, entityId: string, status: LikeStatus): Promise<void> {
        return await likesRepository.updateLikeStatus(userId, entityId, status)
    }
}