import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { WithId } from "mongodb"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { postsService } from "../../domain/posts.service"
import { RawComment } from "../../../comments/models/commentTypes"
import { commentsQueryService } from "../../../comments/domain/comments.query.service"
import { mapCommentToOutput } from "../../../comments/models/mapCommentToOutput"

export const createCommentForPost = async (req: Request, res: Response) => {
    try {
        const createdCommentId: string = await postsService.createCommentForPost(String(req.params.postId), req.user!, req.body)

        const insertedCommentWithId: WithId<RawComment> = await commentsQueryService.findCommentById(createdCommentId)

        const newCommentOutput = mapCommentToOutput(insertedCommentWithId)

        res.status(HTTPStatusCode.CREATED).send(newCommentOutput)
    }

    catch(e: unknown) {
        errorsHandler(e, res)
    }
}