import { NextFunction, Request, Response } from 'express'
import { HTTPStatusCode } from '../../utils/status-codes'
import { jwtService } from '../../../users/application/jwt.service'
import { usersQueryService } from '../../../users/domain/users.query.service'
import { sessionsRepository } from '../../device-sessions/repositories/sessionsRepository'
 
export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.cookies.refreshToken) {
            return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        }

        const token = String(req.cookies.refreshToken)

        const payload = await jwtService.getRefreshTokenPayload(token)

        await sessionsRepository.checkRefreshToken(payload.userId.toString(), payload.deviceId.toString(), payload.iat!.toString())

        const user = await usersQueryService.findUser(payload.userId)

        if (!user) {
            return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        }
        
        req.user = user
        next()
        return
    }
    catch {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}