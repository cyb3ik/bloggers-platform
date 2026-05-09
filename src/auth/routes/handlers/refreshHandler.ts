import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { jwtService } from "../../../users/application/jwt.service"
import { sessionsRepository } from "../../../core/device-sessions/repositories/sessionsRepository"

export const refreshHandler = async (req: Request, res: Response) => {
    try {
        const oldRefreshTokenPayload = await jwtService.getRefreshTokenPayload(req.cookies.refreshToken)

        const accessToken = await jwtService.createAccessToken(req.user._id.toString())
        const refreshToken = await jwtService.createRefreshToken(req.user._id.toString(), oldRefreshTokenPayload.deviceId)

        const newRefreshTokenPayload = await jwtService.getRefreshTokenPayload(refreshToken)

        await sessionsRepository.updateSessionInformation(newRefreshTokenPayload.userId, newRefreshTokenPayload.deviceId, oldRefreshTokenPayload.iat!.toString(), newRefreshTokenPayload.iat!.toString())

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        return res.status(HTTPStatusCode.OK).send({accessToken: accessToken})
    }
    catch(e) {
        return res.sendStatus(HTTPStatusCode.UNAUTHORIZED)
    }
}