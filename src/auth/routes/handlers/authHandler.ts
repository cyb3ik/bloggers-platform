import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { usersQueryService } from "../../../users/domain/users.query.service"
import { jwtService } from "../../../users/application/jwt.service"
import { randomUUID } from "crypto"
import { RawSession } from "../../../core/device-sessions/types/sessionTypes"
import { sessionsRepository } from "../../../core/device-sessions/repositories/sessionsRepository"

export const authHandler = async (req: Request, res: Response) => {
    const user = await usersQueryService.checkCredentials(req.body.loginOrEmail, req.body.password)

    if (user) {
        const userId = user._id.toString()

        const accessToken = await jwtService.createAccessToken(userId)

        const deviceId = randomUUID().toString()
        const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

        const refreshTokenPayload = await jwtService.getRefreshTokenPayload(refreshToken)

        const newSession: RawSession = {
            ip: req.ip!,
            title: req.headers["user-agent"] || "Device",
            lastActiveDate: refreshTokenPayload.iat!.toString(),
            deviceId: deviceId,
            userId: userId,
            exp: refreshTokenPayload.exp!.toString()
        }

        await sessionsRepository.addSession(newSession)

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(HTTPStatusCode.OK).send({accessToken: accessToken})
        return
        
    } else {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}