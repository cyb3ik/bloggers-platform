import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { postsService } from "../../domain/posts.service"
import { mapPostToOutput } from "../../models/mapPostToOutput"
import { WithId } from "mongodb"
import { RawPost } from "../../models/postTypes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { postsQueryService } from "../../domain/posts.query.service"

export const createPost = async (req: Request, res: Response) => {
    try {
        const createdPostId: string = await postsService.create(req.body)

        const insertedPostWithId: WithId<RawPost> = await postsQueryService.findById(createdPostId)

        const newPostOutput = mapPostToOutput(insertedPostWithId)

        res.status(HTTPStatusCode.CREATED).send(newPostOutput)
    }

    catch(e: unknown) {
        errorsHandler(e, res)
    }
}