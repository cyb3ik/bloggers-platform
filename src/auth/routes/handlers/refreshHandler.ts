import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { jwtService } from "../../../users/application/jwt.service"
import { usersRepository } from "../../../users/repositories/usersRepository"

export const refreshHandler = async (req: Request, res: Response) => {
    await usersRepository.banRefreshToken(String(req.user._id), req.cookies.refreshToken)

    const accessToken = await jwtService.createAccessToken(req.user)
    const refreshToken = await jwtService.createRefreshToken(req.user)

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
    res.status(HTTPStatusCode.OK).send({accessToken: accessToken})
        
    return
}