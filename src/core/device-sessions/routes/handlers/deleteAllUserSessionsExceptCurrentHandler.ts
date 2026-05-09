import { Request, Response } from "express"
import { sessionsRepository } from "../../repositories/sessionsRepository"
import { HTTPStatusCode } from "../../../utils/status-codes"
import { errorsHandler } from "../../../errors/errors-handler"
import { jwtService } from "../../../../users/application/jwt.service"


export const deleteAllUserSessionsExceptCurrent = async (req: Request, res: Response) => {
    const refreshTokenPayload = await jwtService.getRefreshTokenPayload(req.cookies.refreshToken)
    await sessionsRepository.deleteAllUserSessionsExceptCurrent(req.user._id.toString(), refreshTokenPayload.deviceId)

    return res.sendStatus(HTTPStatusCode.NO_CONTENT)
}