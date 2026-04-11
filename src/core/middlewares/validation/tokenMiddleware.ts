import { NextFunction, Request, Response } from 'express'
import { HTTPStatusCode } from '../../utils/status-codes'
import { jwtService } from '../../../users/application/jwt.service'
import { usersQueryService } from '../../../users/domain/users.query.service'
 
export const tokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization) {
        res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        return
    }

    const token = req.headers.authorization.split(" ")[1]

    const userId = jwtService.getUserIdByToken(token)

    if (userId) {
        req.user = await usersQueryService.findUser(userId)
        next()
        return
    }

    res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    return
}