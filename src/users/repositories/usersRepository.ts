import { usersCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"
import { RawUser } from "../models/userTypes"
import { NotUniqueError } from "../../core/errors/not-unique-error"

export const usersRepository = {

    async checkIfLoginOrEmailIsUnique(login: string, email: string): Promise<void> {
        const checkResult = await usersCollection.find(
            { $or: 
                [ 
                    {login: login}, 
                    {email: email} 
                ] 
            }
        ).toArray()

        if (checkResult.length > 0) {
            throw new NotUniqueError('User with this login or email already exists')
        }

        return
    },

    async createUser(dto: RawUser): Promise<string> {
        const insertedResult = await usersCollection.insertOne(dto)

        return insertedResult.insertedId.toString()
    },

    async deleteUser(id: string): Promise<void> {
        const deleteResult = await usersCollection.deleteOne( { _id: new ObjectId(id) } )    

        if (deleteResult.deletedCount < 1) {
            throw new NotFoundError('User not found')
        }

        return
    }
}