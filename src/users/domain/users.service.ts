import { RawUser, UserInputModel } from "../models/userTypes";
import { usersRepository } from "../repositories/usersRepository";
import bcrypt from "bcrypt"
import {randomUUID} from "crypto"

export const usersService = {

    async create(body: UserInputModel): Promise<string> {
        await usersRepository.checkIfLoginOrEmailIsUnique(body.login, body.email)

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(body.password, passwordSalt)

        const newUser: RawUser = {
            login: body.login,
            email: body.email,
            createdAt: new Date().toISOString(),
            passwordSalt: passwordSalt,
            passwordHash: passwordHash,
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: new Date(),
                isConfirmed: true
            }
        }

        return await usersRepository.createUser(newUser)
    },

    async updatePassword(id: string, password: string): Promise<void> {
        const newPasswordSalt = await bcrypt.genSalt(10)
        const newPasswordHash = await bcrypt.hash(password, newPasswordSalt)

        await usersRepository.updatePassword(id, newPasswordHash, newPasswordSalt)
    },

    async delete(id: string): Promise<void> {
        return await usersRepository.deleteUser(id)
    }
}