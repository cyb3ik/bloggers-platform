import { requestsCollection } from "../../../db/mongo.db"
import { add } from "date-fns/add"
import { Req } from "../types/requestTypes"

export const requestsRepository = {
    async requestRateFromIp(ip: string, url: string, date: Date): Promise<number> {
        const rate = await requestsCollection.countDocuments({
            ip: ip,
            url: url,
            date: {
                $gte: add(date, {
                    seconds: -10
                })
            }
        })
        return rate
    },

    async addRequestFromIp(req: Req): Promise<void> {
        await requestsCollection.insertOne(req)
        return
    }
}