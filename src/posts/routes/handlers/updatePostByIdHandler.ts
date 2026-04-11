import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { postsService } from "../../domain/posts.service"
import { errorsHandler } from "../../../core/errors/errors-handler"

export const updatePostById = async (req: Request, res: Response) => {
    try {
        await postsService.update(String(req.params.id), req.body)
        
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}