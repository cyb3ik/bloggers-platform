import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { LikeStatus } from "../../../likes/models/likes-types"
import { likesQueryService } from "../../../likes/domain/likes.query.service"
import { likesService } from "../../../likes/domain/likes.service"
import { postsQueryService } from "../../domain/posts.query.service"
import { postsService } from "../../domain/posts.service"

export const likePostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId.toString()
        const userId = req.user._id.toString()
        const userLogin = req.user.login
        const status = req.body.likeStatus

        await postsQueryService.findPostById(postId)

        const currentStatus: LikeStatus | null = await likesQueryService.getUserStatus(postId, userId)

        if (!currentStatus || currentStatus === "None") {
            if (currentStatus === null) await likesService.addLike(userId, userLogin, postId, status)
            switch (status) {
                case "Like":
                    await postsService.updateLikesAndDislikesCount(postId, 1, 0)
                    break
                case "Dislike":
                    await postsService.updateLikesAndDislikesCount(postId, 0, 1)
                    break
                case "None":
                    await postsService.updateLikesAndDislikesCount(postId, 0, 0)
                    break
            }
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        if (currentStatus === "Like") {
            switch (status) {
                case "Dislike":
                    await postsService.updateLikesAndDislikesCount(postId, -1, 1)
                    break
                case "None":
                    await postsService.updateLikesAndDislikesCount(postId, -1, 0)
                    break
            }
            await likesService.updateLikeStatus(userId, postId, status)
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        if (currentStatus === "Dislike") {
            switch (status) {
                case "Like":
                    await postsService.updateLikesAndDislikesCount(postId, 1, -1)
                    break
                case "None":
                    await postsService.updateLikesAndDislikesCount(postId, 0, -1)
                    break
            }
            await likesService.updateLikeStatus(userId, postId, status)
            return res.sendStatus(HTTPStatusCode.NO_CONTENT)
        }

        return res.sendStatus(HTTPStatusCode.NO_CONTENT)
    }

    catch(e) {
        errorsHandler(e, res)
    }
}