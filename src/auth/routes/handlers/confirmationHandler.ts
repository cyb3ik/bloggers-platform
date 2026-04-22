import { Request, Response } from "express"
import { usersQyRepository } from "../../../users/repositories/usersQyRepository"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { usersRepository } from "../../../users/repositories/usersRepository"

export const confirmationHandler = async (req: Request, res: Response) => {
    try {
        const user = await usersQyRepository.findUserByConfirmationCode(req.body.code)

        if (!user) {
            return res.status(HTTPStatusCode.BAD_REQUEST).send({ errorsMessages: [{
                "message": 'Code is wrong',
                "field": "code"
            }]})
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return res.status(HTTPStatusCode.BAD_REQUEST).send({ errorsMessages: [{
                "message": 'Code has expired',
                "field": "code"
            }]})
        }

        if (user.emailConfirmation.isConfirmed) {
            return res.status(HTTPStatusCode.BAD_REQUEST).send({ errorsMessages: [{
                "message": 'Code has already been applied',
                "field": "code"
            }]})
        }

        await usersRepository.confirmEmail(user._id.toString())

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    } 
    catch(e) {
        errorsHandler(e, res)
    }
}