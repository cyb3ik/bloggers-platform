import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"

export const mePageHandler = (req: Request, res: Response) => {
    const meInfo = {
        email: req.user.email,
        login: req.user.login,
        userId: String(req.user._id)
    }

    res.status(HTTPStatusCode.OK).send(meInfo)
}
