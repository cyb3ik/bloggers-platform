import { NextFunction, Request, Response } from 'express'
import { HTTPStatusCode } from '../../utils/status-codes'
import { jwtService } from '../../../users/application/jwt.service'
import { usersQueryService } from '../../../users/domain/users.query.service'
 
export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.cookies.refreshToken) {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }

    const token = String(req.cookies.refreshToken)

    const userId = jwtService.getUserIdByRefreshToken(token)

    if (userId) {
        const user = await usersQueryService.findUser(userId)
        if (!user.invalidRefreshTokens.includes(token)) {
            req.user = user
            next()
            return
        }
    }

    return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
}