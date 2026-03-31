import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { RawBlog } from "../../models/blogTypes"
import { blogsService } from "../../application/blogs.service"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { mapBlogToOutput } from "../../models/mapBlogToOutput"
import { WithId } from "mongodb"

export const readBlogById = async (req: Request, res: Response) => {
    try {
        const foundBlog: WithId<RawBlog> = await blogsService.findById(String(req.params.id))

        res.status(HTTPStatusCode.OK).send(mapBlogToOutput(foundBlog))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}