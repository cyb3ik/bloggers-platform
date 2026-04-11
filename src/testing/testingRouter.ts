import { Router, Request, Response } from "express"
import { HTTPStatusCode } from "../core/utils/status-codes"
import { commentsCollection, postsCollection, usersCollection } from "../db/mongo.db"
import { blogsCollection } from "../db/mongo.db"

export const testingRouter = Router()

testingRouter
    .delete("/all-data", (req: Request, res: Response) =>{
        postsCollection.deleteMany({})
        blogsCollection.deleteMany({})
        usersCollection.deleteMany({})
        commentsCollection.deleteMany({})
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    })