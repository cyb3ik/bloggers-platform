import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { commentsService } from "../../domain/comments.service"

export const updateCommentById = async (req: Request, res: Response) => {
    try {
        await commentsService.update(String(req.params.id), req.body)
        
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}