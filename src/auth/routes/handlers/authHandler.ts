import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { usersQueryService } from "../../../users/domain/users.query.service"
import { jwtService } from "../../../users/application/jwt.service"

export const authHandler = async (req: Request, res: Response) => {
    const user = await usersQueryService.checkCredentials(req.body.loginOrEmail, req.body.password)

    if (user) {
        const token = await jwtService.createJWT(user)
        return res.status(HTTPStatusCode.OK).send({accessToken: token})
    } else {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}