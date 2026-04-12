import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { usersQueryService } from "../../../users/domain/users.query.service"
import { jwtService } from "../../../users/application/jwt.service"

export const authHandler = async (req: Request, res: Response) => {
    const user = await usersQueryService.checkCredentials(req.body.loginOrEmail, req.body.password)

    if (!user) {
        res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
        return
    }
    
    const token = jwtService.createJWT(user)

    if (!token) {
        res.sendStatus(HTTPStatusCode.INTERNAL_SERVER_ERROR)
        return
    }

    res.status(HTTPStatusCode.OK).send(token)
}