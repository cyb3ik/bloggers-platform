import { sessionsCollection } from "../../../db/mongo.db"
import { RawSession } from "../types/sessionTypes"
import { WithId } from "mongodb"

export const sessionsRepository = {
    async findAllUserSessions(userId: string): Promise<WithId<RawSession>[]> {
        const userSessions = await sessionsCollection.find({ userId: userId }).toArray()
        return userSessions
    },

    async findSessionByDeviceId(deviceId: string): Promise<WithId<RawSession> | null> {
        const deviceSession = await sessionsCollection.findOne({ deviceId: deviceId })
        return deviceSession
    },

    async addSession(session: RawSession): Promise<void> {
        await sessionsCollection.insertOne(session)
        return
    },

    async updateSessionInformation(userId: string, deviceId: string, iat: string, timestamp: string): Promise<void> {
        await sessionsCollection.updateOne({
            userId: userId,
            deviceId: deviceId,
            lastActiveDate: iat
        },
        {
            $set: {
                lastActiveDate: timestamp
            }
        })
        return
    },

    async deleteAllUserSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
        await sessionsCollection.deleteMany({
            userId: userId,
            deviceId: { $ne: deviceId }
        })
        return
    },

    async deleteCurrentUserSession(userId: string, deviceId: string): Promise<void> {
        await sessionsCollection.deleteOne({
            userId: userId,
            deviceId: deviceId
        })
        return
    },

    async deleteSpecifiedDeviceSession(userId: string, deviceId: string): Promise<void> {
        await sessionsCollection.deleteOne({
            userId: userId,
            deviceId: deviceId
        })

        return
    },

    async checkRefreshToken(userId: string, deviceId: string, iat: string): Promise<void> {
        const activeSession = await sessionsCollection.findOne({
            userId: userId,
            deviceId: deviceId,
            lastActiveDate: iat
        })

        if (!activeSession) {
            throw new Error()
        }

        return
    }
}