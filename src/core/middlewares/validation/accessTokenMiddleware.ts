import { NextFunction, Request, Response } from 'express'
import { HTTPStatusCode } from '../../utils/status-codes'
import { jwtService } from '../../../users/application/jwt.service'
import { usersQueryService } from '../../../users/domain/users.query.service'
 
export const accessTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        }

        const token = req.headers.authorization.split(" ")[1]

        const payload = await jwtService.getAccessTokenPayload(token)

        if (!payload.userId) {
            return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        }

        req.user = await usersQueryService.findUser(payload.userId)
        next()
    }
    catch(e) {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}