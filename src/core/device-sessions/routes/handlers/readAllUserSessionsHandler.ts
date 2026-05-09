import { Request, Response } from "express"
import { sessionsRepository } from "../../repositories/sessionsRepository"
import { HTTPStatusCode } from "../../../utils/status-codes"
import { errorsHandler } from "../../../errors/errors-handler"


export const readAllUserSessions = async (req: Request, res: Response) => {
    const userSessions = await sessionsRepository.findAllUserSessions(req.user._id.toString())
    
        // СДЕЛАТЬ МАППЕР
    const result = userSessions.map(s => {
        return {
            ip: s.ip,
            title: s.title,
            lastActiveDate: new Date(Number(s.lastActiveDate) * 1000).toISOString(),
            deviceId: s.deviceId
        }
    })

    return res.status(HTTPStatusCode.OK).send(result)
}