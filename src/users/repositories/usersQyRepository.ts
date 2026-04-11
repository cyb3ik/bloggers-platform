import { usersCollection } from "../../db/mongo.db"
import { ObjectId, WithId } from "mongodb"
import { NotFoundError } from "../../core/errors/not-found-error"
import { PaginationUserQuery, RawUser } from "../models/userTypes"

export const usersQyRepository = {

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
    }
}