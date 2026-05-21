import { Router, Request, Response } from "express"
import { HTTPStatusCode } from "../core/utils/status-codes"
import { commentsCollection, likesCollection, postsCollection, requestsCollection, sessionsCollection, usersCollection } from "../db/mongo.db"
import { blogsCollection } from "../db/mongo.db"

export const testingRouter = Router()

testingRouter
    .delete("/all-data", async (req: Request, res: Response) =>{
        await postsCollection.deleteMany({})
        await blogsCollection.deleteMany({})
        await usersCollection.deleteMany({})
        await likesCollection.deleteMany({})
        await commentsCollection.deleteMany({})
        await requestsCollection.deleteMany({})
        await commentsCollection.deleteMany({})
        await sessionsCollection.deleteMany({})
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    })