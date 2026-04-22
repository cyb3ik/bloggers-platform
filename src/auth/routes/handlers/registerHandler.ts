import { Request, Response } from "express"
import { authService } from "../../domain/auth.service"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"

export const registerHandler = async (req: Request, res: Response) => {
    try {
        await authService.registerUser(req.body)

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}