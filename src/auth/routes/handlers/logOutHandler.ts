import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { jwtService } from "../../../users/application/jwt.service"
import { sessionsRepository } from "../../../core/device-sessions/repositories/sessionsRepository"

export const logOutHandler = async (req: Request, res: Response) => {
    const refreshTokenPayload = await jwtService.getRefreshTokenPayload(req.cookies.refreshToken)

    await sessionsRepository.deleteCurrentUserSession(refreshTokenPayload.userId, refreshTokenPayload.deviceId)
    
    res.sendStatus(HTTPStatusCode.NO_CONTENT)  
    return
}