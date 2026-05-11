import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { authService } from "../../domain/auth.service"

export const recoveryHandler = async (req: Request, res: Response) => {
    try {
        await authService.sendPasswordRecoveryCode(req.body.email)

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}