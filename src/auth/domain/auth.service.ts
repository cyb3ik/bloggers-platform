import { randomUUID } from "crypto";

import bcrypt from "bcrypt"
import {add} from "date-fns/add"
import { usersRepository } from "../../users/repositories/usersRepository";
import { mailService } from "../../users/adapters/mailService";
import { RawUser, UserInputModel } from "../../users/models/userTypes";
import { usersQyRepository } from "../../users/repositories/usersQyRepository";
import { AlreadyConfirmedError } from "../../core/errors/confirmation-error";
import { EmailError } from "../../core/errors/email-error";

export const authService = {
    async registerUser(body: UserInputModel): Promise<void> {
        const user = await usersQyRepository.findUserByEmail(body.email)

        if (user) {
            throw new EmailError('User with such email already exists')
        }

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(body.password, passwordSalt)

        const newUser: RawUser = {
            login: body.login,
            email: body.email,
            createdAt: new Date().toISOString(),
            passwordSalt: passwordSalt,
            passwordHash: passwordHash,
            emailConfirmation: {
                confirmationCode: randomUUID().toString(),
                expirationDate: add(new Date(), {
                    hours: 2
                }),
                isConfirmed: false
            }
        }

        await usersRepository.createUser(newUser)

        mailService.sendEmail(newUser.email, newUser.emailConfirmation.confirmationCode).catch(e => console.log(e))
    },

    async resendConfirmationCode(email: string): Promise<void> {
        const user = await usersQyRepository.findUserByEmail(email)

        if (user.emailConfirmation.isConfirmed) {
            throw new AlreadyConfirmedError('Email already confirmed')
        }

        const newConfirmationInfo =  {
            confirmationCode: randomUUID().toString(),
            expirationDate: add(new Date(), {
                hours: 2
            }),
            isConfirmed: false
        }

        await usersRepository.updateConfirmationInfo(user._id.toString(), newConfirmationInfo)

        mailService.sendEmail(email, newConfirmationInfo.confirmationCode).catch(e => console.log(e))
    }
}