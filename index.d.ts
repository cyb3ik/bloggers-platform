import { ObjectId } from "mongodb";

declare global {
    namespace Express {
        export interface Request {
            user: WithId<RawUser> | null
        }
    }
}