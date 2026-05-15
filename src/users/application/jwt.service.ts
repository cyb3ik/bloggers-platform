import jwt, { JwtPayload } from "jsonwebtoken"
import { WithId } from "mongodb"
import { RawUser } from "../models/userTypes"
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../../core/settings/config"

export const jwtService = {

    async createAccessToken(userId: string): Promise<string> {
        const token = await jwt.sign({userId: userId}, JWT_ACCESS_SECRET!, {expiresIn: '5m'})
        return token
    },

    async createRefreshToken(userId: string, deviceId: string): Promise<string> {
        const token = await jwt.sign({userId: userId, deviceId: deviceId }, JWT_REFRESH_SECRET!, {expiresIn: '10m'})
        return token
    },

    async getAccessTokenPayload(token: string): Promise<JwtPayload> {
        const result: any = await jwt.verify(token, JWT_ACCESS_SECRET!)
        return result
    },

    async getRefreshTokenPayload(token: string): Promise<JwtPayload> {
        const result: any = await jwt.verify(token, JWT_REFRESH_SECRET!)
        return result
    },
    
}