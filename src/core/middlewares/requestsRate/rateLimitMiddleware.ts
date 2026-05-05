import { NextFunction, Request, Response } from 'express'
import { requestsRepository } from '../../requests/repositories/requestsRepository'
import { HTTPStatusCode } from '../../utils/status-codes'
 
export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const currentDate = new Date()
    const rate = await requestsRepository.requestRateFromIp(req.ip!, req.originalUrl, currentDate)

    if (rate > 5) {
        return res.sendStatus(HTTPStatusCode.TOO_MANY_REQUESTS)
    }

    else {
        next()
    }
}