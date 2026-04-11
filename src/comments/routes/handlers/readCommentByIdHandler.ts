import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { RawComment } from "../../models/commentTypes"
import { WithId } from "mongodb"
import { commentsQueryService } from "../../domain/comments.query.service"
import { mapCommentToOutput } from "../../models/mapCommentToOutput"

export const readCommentById = async (req: Request, res: Response) => {
    try {
        const foundComment: WithId<RawComment> = await commentsQueryService.findComment(String(req.params.id))

        res.status(HTTPStatusCode.OK).send(mapCommentToOutput(foundComment))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}