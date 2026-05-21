import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { commentsQueryService } from "../../domain/comments.query.service"
import { LikeStatus } from "../../../likes/models/likes-types"
import { likesQueryService } from "../../../likes/domain/likes.query.service"
import { commentsService } from "../../domain/comments.service"
import { likesService } from "../../../likes/domain/likes.service"

export const likeCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.commentId.toString()
        const userId = req.user._id.toString()
        const status = req.body.likeStatus

        await commentsQueryService.findCommentById(commentId)

        const currentStatus: LikeStatus | null = await likesQueryService.getUserStatus(commentId, userId)

        if (!currentStatus || currentStatus === "None") {
            if (currentStatus === null) await likesService.addLike(userId, commentId, status)
            switch (status) {
                case "Like":
                    await commentsService.updateLikesAndDislikesCount(commentId, 1, 0)
                    break
                case "Dislike":
                    await commentsService.updateLikesAndDislikesCount(commentId, 0, 1)
                    break
                case "None":
                    await commentsService.updateLikesAndDislikesCount(commentId, 0, 0)
                    break
            }
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        if (currentStatus === "Like") {
            switch (status) {
                case "Dislike":
                    await commentsService.updateLikesAndDislikesCount(commentId, -1, 1)
                    break
                case "None":
                    await commentsService.updateLikesAndDislikesCount(commentId, -1, 0)
                    break
            }
            await likesService.updateLikeStatus(userId, commentId, status)
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        if (currentStatus === "Dislike") {
            switch (status) {
                case "Like":
                    await commentsService.updateLikesAndDislikesCount(commentId, 1, -1)
                    break
                case "None":
                    await commentsService.updateLikesAndDislikesCount(commentId, 0, -1)
                    break
            }
            await likesService.updateLikeStatus(userId, commentId, status)
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }

    catch(e) {
        errorsHandler(e, res)
    }
}