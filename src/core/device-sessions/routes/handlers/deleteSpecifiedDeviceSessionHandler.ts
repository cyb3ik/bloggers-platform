import { Request, Response } from "express"
import { sessionsRepository } from "../../repositories/sessionsRepository"
import { HTTPStatusCode } from "../../../utils/status-codes"


export const deleteSpecifiedDeviceSession = async (req: Request, res: Response) => {
    const userId = req.user._id.toString()
    const deviceId = req.params.deviceId.toString()

    const session = await sessionsRepository.findSessionByDeviceId(deviceId)

    if (!session) {
        return res.sendStatus(HTTPStatusCode.NOT_FOUND)
    }

    if (session.userId !== userId) {
        return res.sendStatus(HTTPStatusCode.ACCESS_FORBIDDEN)
    }

    await sessionsRepository.deleteSpecifiedDeviceSession(userId, deviceId)

    return res.sendStatus(HTTPStatusCode.NO_CONTENT)
}