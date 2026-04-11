import { WithId } from "mongodb"
import bcrypt from "bcrypt"
import { PaginationUserQuery, RawUser } from "../models/userTypes"
import { usersQyRepository } from "../repositories/usersQyRepository"

export const usersQueryService = {

    async findAll(query: PaginationUserQuery): Promise<{totalCount: number, items: WithId<RawUser>[]}> {
        return usersQyRepository.findAllUsers(query)
    },

    async findUser(id: string): Promise<WithId<RawUser>> {
        return usersQyRepository.findUserById(id)
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<WithId<RawUser> | null> {
        const user = await usersQyRepository.findByLoginOrEmail(loginOrEmail)

        if (!user) {
            return null
        }

        if (user.passwordHash !== await bcrypt.hash(password, user.passwordSalt)) {
            return null
        }

        return user
    }
}