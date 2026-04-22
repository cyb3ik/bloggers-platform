import { Request, Response } from "express"
import { authService } from "../../domain/auth.service"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"

export const resendHandler = async (req: Request, res: Response) => {
    try {
        await authService.resendConfirmationCode(req.body.email)

        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}