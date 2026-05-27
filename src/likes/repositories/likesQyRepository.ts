import { WithId } from "mongodb"
import { likesCollection } from "../../db/mongo.db"
import { LikeStatus, RawLike } from "../models/likes-types"

export const likesQyRepository = {
    async getUserStatusFromEntity(entityId: string, userId: string): Promise<LikeStatus | null> {
        const result = await likesCollection.findOne({
            entityId: entityId,
            userId: userId
        })

        if (!result) {
            return null
        }

        return result.status
    },

    async getAllEntityLikesWithStatus(entityId: string, status: LikeStatus): Promise<WithId<RawLike>[]> {
        const items = await likesCollection
        .find(
            {
                entityId: entityId,
                status: status
            }
        )
        .sort({ addedAt: -1 })
        .toArray()

        return items
    }
}