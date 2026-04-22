import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { blogsService } from "../../domain/blogs.service"
import { WithId } from "mongodb"
import { RawBlog } from "../../models/blogTypes"
import { mapBlogToOutput } from "../../models/mapBlogToOutput"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { blogsQueryService } from "../../domain/blogs.query.service"

export const createBlog = async (req: Request, res: Response) => {
    try {
        const createdBlogId: string = await blogsService.createBlog(req.body)

        const insertedBlogWithId: WithId<RawBlog> = await blogsQueryService.findBlogById(createdBlogId)

        const newBlogOutput = mapBlogToOutput(insertedBlogWithId)

        return res.status(HTTPStatusCode.CREATED).send(newBlogOutput)
    }

    catch(e: unknown) {
        errorsHandler(e, res)
    }
}