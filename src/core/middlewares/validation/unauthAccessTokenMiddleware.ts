import { NextFunction, Request, Response } from 'express'
import { HTTPStatusCode } from '../../utils/status-codes'
import { jwtService } from '../../../users/application/jwt.service'
import { usersQueryService } from '../../../users/domain/users.query.service'
 
export const unauthAccessTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            next()
            return
        }

        const token = req.headers.authorization.split(" ")[1]

        const payload = await jwtService.getAccessTokenPayload(token)

        if (!payload.userId) {
            next()
            return
        }

        req.user = await usersQueryService.findUser(payload.userId)
        next()
    }
    catch(e) {
        next()
        return
    }
}