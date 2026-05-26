import { likesCollection, postsCollection } from "../../db/mongo.db"
import { LikeStatus, RawLike } from "../models/likes-types"

export const likesRepository = {

    async createLike(dto: RawLike): Promise<void> {
        await likesCollection.insertOne(dto)
        return
    },

    async updateLikeStatus(userId: string, entityId: string, status: LikeStatus): Promise<void> {
        await likesCollection.updateOne(
            { 
                userId: userId,
                entityId: entityId
            },
            {
                $set: {
                    status: status
                }
            }
        )
        return
    }

}