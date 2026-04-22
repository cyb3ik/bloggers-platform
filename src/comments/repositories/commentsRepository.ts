import { commentsCollection, usersCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"
import { CommentInputModel, RawComment } from "../models/commentTypes"

export const commentsRepository = {

    async createComment(dto: RawComment): Promise<string> {
        const insertedResult = await commentsCollection.insertOne(dto)

        return insertedResult.insertedId.toString()
    },

    async updateCommentById(id: string, body: CommentInputModel): Promise<void> {
        const updateResult = await commentsCollection.updateOne( 
            { _id: new ObjectId(id) },
            { 
                $set: {
                    content: body.content
                }
            }
        )
                
        if (updateResult.matchedCount < 1) {
            throw new NotFoundError('Comment not found')
        }
        
        return
    },

    async deleteCommentById(id: string): Promise<void> {
        const deleteResult = await commentsCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('Comment not found')
        }

        return
    }
}