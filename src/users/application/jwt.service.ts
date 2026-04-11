import jwt from "jsonwebtoken"
import { WithId } from "mongodb"
import { RawUser } from "../models/userTypes"
import { JWT_SECRET } from "../../core/settings/config"

export const jwtService = {

    createJWT(user: WithId<RawUser>): string {
        const token = jwt.sign({userId: user._id.toString()}, JWT_SECRET, {expiresIn: '1h'})
        return token
    },

    getUserIdByToken(token: string): string | null {
        try {
            const result: any = jwt.verify(token, JWT_SECRET)
            return result.userId
        }
        catch(e) {
            return null
        }
    }
}