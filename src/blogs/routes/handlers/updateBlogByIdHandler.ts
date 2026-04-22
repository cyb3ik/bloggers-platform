import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { blogsService } from "../../domain/blogs.service"
import { errorsHandler } from "../../../core/errors/errors-handler"

export const updateBlogById = async (req: Request, res: Response) => {
    try {
        await blogsService.updateBlogById(String(req.params.id), req.body)
        
        res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}