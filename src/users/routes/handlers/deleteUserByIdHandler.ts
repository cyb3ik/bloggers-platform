import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { usersService } from "../../domain/users.service"

export const deleteUserById = async (req: Request, res: Response) => {
    try {
        await usersService.delete(String(req.params.id))

        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}