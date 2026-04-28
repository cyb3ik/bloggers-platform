import jwt from "jsonwebtoken"
import { WithId } from "mongodb"
import { RawUser } from "../models/userTypes"
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../../core/settings/config"

export const jwtService = {

    async createAccessToken(user: WithId<RawUser>): Promise<string> {
        const token = jwt.sign({userId: user._id.toString()}, JWT_ACCESS_SECRET!, {expiresIn: '10s'})
        return token
    },

    async createRefreshToken(user: WithId<RawUser>): Promise<string> {
        const token = jwt.sign({userId: user._id.toString()}, JWT_REFRESH_SECRET!, {expiresIn: '20s'})
        return token
    },

    getUserIdByAccessToken(token: string): string | null {
        try {
            const result: any = jwt.verify(token, JWT_ACCESS_SECRET!)
            return result.userId
        }
        catch(e) {
            return null
        }
    },

    getUserIdByRefreshToken(token: string): string | null {
        try {
            const result: any = jwt.verify(token, JWT_REFRESH_SECRET!)
            return result.userId
        }
        catch(e) {
            return null
        }
    },
    
}