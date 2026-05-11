import { Request, Response } from "express"
import { usersQyRepository } from "../../../users/repositories/usersQyRepository"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { usersRepository } from "../../../users/repositories/usersRepository"
import { usersService } from "../../../users/domain/users.service"

export const recoveryConfirmationHandler = async (req: Request, res: Response) => {
    try {
        const user = await usersQyRepository.findUserByPasswordRecoveryCode(req.body.recoveryCode)

        if (!user) {
            return res.status(HTTPStatusCode.BAD_REQUEST).send({ errorsMessages: [{
                "message": 'Code is wrong',
                "field": "recoveryCode"
            }]})
        }

        if (user.passwordRecovery!.expirationDate < new Date()) {
            return res.status(HTTPStatusCode.BAD_REQUEST).send({ errorsMessages: [{
                "message": 'Code has expired',
                "field": "recoveryCode"
            }]})
        }

        await usersService.updatePassword(user._id.toString(), req.body.newPassword)

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    } 
    catch(e) {
        errorsHandler(e, res)
    }
}