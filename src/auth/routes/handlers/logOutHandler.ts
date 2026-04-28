import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { usersRepository } from "../../../users/repositories/usersRepository"

export const logOutHandler = async (req: Request, res: Response) => {
    await usersRepository.banRefreshToken(String(req.user._id), req.cookies.refreshToken)
    res.sendStatus(HTTPStatusCode.NO_CONTENT)  
    return
}