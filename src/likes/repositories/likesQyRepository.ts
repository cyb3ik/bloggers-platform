import { likesCollection } from "../../db/mongo.db"
import { LikeStatus } from "../models/likes-types"

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
    }
}