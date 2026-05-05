import { NextFunction, Request, Response } from 'express'
import { requestsRepository } from '../../requests/repositories/requestsRepository'
 
export const saveRequestInfoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const request = {
        ip: req.ip!,
        url: req.originalUrl,
        date: new Date()
    }

    await requestsRepository.addRequestFromIp(request)

    next()
}