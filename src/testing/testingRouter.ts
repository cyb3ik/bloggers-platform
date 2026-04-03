import { Router, Request, Response } from "express"
import { HTTPStatusCode } from "../core/utils/status-codes"
import { postsCollection, usersCollection } from "../db/mongo.db"
import { blogsCollection } from "../db/mongo.db"

export const testingRouter = Router()

testingRouter
    .delete("/all-data", (req: Request, res: Response) =>{
        postsCollection.deleteMany({})
        blogsCollection.deleteMany({})
        usersCollection.deleteMany({})
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    })