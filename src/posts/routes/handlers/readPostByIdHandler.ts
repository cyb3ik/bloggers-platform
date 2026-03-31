import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { RawPost } from "../../models/postTypes"
import { postsService } from "../../application/posts.service"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { WithId } from "mongodb"
import { mapPostToOutput } from "../../models/mapPostToOutput"

export const readPostById = async (req: Request, res: Response) => {
    try {
        const foundPost: WithId<RawPost> = await postsService.findById(String(req.params.id))

        res.status(HTTPStatusCode.OK).send(mapPostToOutput(foundPost))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}