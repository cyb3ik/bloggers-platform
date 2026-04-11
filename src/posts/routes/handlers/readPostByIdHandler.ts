import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { RawPost } from "../../models/postTypes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { WithId } from "mongodb"
import { mapPostToOutput } from "../../models/mapPostToOutput"
import { postsQueryService } from "../../domain/posts.query.service"

export const readPostById = async (req: Request, res: Response) => {
    try {
        const foundPost: WithId<RawPost> = await postsQueryService.findById(String(req.params.id))

        res.status(HTTPStatusCode.OK).send(mapPostToOutput(foundPost))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}