import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { commentsService } from "../../domain/comments.service"

export const deleteCommentById = async (req: Request, res: Response) => {
    try {
        await commentsService.delete(String(req.params.id))

        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}