import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { commentsService } from "../../domain/comments.service"
import { commentsQueryService } from "../../domain/comments.query.service"

export const deleteCommentById = async (req: Request, res: Response) => {
    try {

        const comment = await commentsQueryService.findComment(req.user._id.toString())

        if (comment.commentatorInfo.userId === req.user._id.toString()) {
            await commentsService.delete(String(req.params.id))
            
            res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }
        else {
            res.sendStatus(HTTPStatusCode.ACCESS_FORBIDDEN)
        }
    }
    catch(e) {
        errorsHandler(e, res)
    }
}