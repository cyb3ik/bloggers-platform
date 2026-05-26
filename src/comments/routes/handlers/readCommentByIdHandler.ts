import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { RawComment } from "../../models/commentTypes"
import { WithId } from "mongodb"
import { commentsQueryService } from "../../domain/comments.query.service"
import { mapCommentToOutput } from "../../models/mapCommentToOutput"
import { LikeStatus } from "../../../likes/models/likes-types"
import { likesQueryService } from "../../../likes/domain/likes.query.service"

export const readCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id.toString()
        if (req.user) {
            var userId = req.user._id.toString()
        }

        const foundComment: WithId<RawComment> = await commentsQueryService.findCommentById(commentId)

        let status: LikeStatus | null = LikeStatus.None

        if (userId) {
            status = await likesQueryService.getUserStatus(commentId, userId)

            if (!status) {
                status = LikeStatus.None
            }
        }

        res.status(HTTPStatusCode.OK).send(mapCommentToOutput(foundComment, status))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}