import { usersCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"
import { PaginationUserQuery, RawUser } from "../models/userTypes"
import { NotUniqueError } from "../../core/errors/not-unique-error"

export const usersRepository = {

    async findAllUsers(query: PaginationUserQuery): Promise<{ 
        totalCount: number, 
        items: WithId<RawUser>[] }> {
            const {pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = query

            const skip = Math.ceil((pageNumber - 1) * pageSize)

            const limit = pageSize

            const filter: any = {}

            if (searchEmailTerm || searchLoginTerm) {
                filter.$or = []
            }

            if (searchLoginTerm) {
                filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i'}})
            }

            if (searchEmailTerm) {
                filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i'}})
            }

            const items = await usersCollection
                .find(filter)
                .sort( {[sortBy]: sortDirection} )
                .skip(skip)
                .limit(limit)
                .toArray()
            const totalCount = await usersCollection.countDocuments(filter)

            return {totalCount: totalCount, items: items}
    },

    async findUserById(id: string): Promise<WithId<RawUser>> {
            const result = await usersCollection.findOne( { _id: new ObjectId(id) })
    
            if (!result) {
                throw new NotFoundError('Blog not found')
            }
    
            return result
        },

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

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<RawUser> | null> {
        const user = await usersCollection.findOne(
            {
                $or: [
                    {login: loginOrEmail},
                    {email: loginOrEmail}
                ]
            }
        )

        return user
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