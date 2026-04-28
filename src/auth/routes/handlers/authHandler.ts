import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { usersQueryService } from "../../../users/domain/users.query.service"
import { jwtService } from "../../../users/application/jwt.service"

export const authHandler = async (req: Request, res: Response) => {
    const user = await usersQueryService.checkCredentials(req.body.loginOrEmail, req.body.password)

    if (user) {
        const accessToken = await jwtService.createAccessToken(user)
        const refreshToken = await jwtService.createRefreshToken(user)

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(HTTPStatusCode.OK).send({accessToken: accessToken})

        return
    } else {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}