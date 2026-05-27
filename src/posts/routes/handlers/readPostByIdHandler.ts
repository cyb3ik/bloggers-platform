import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { RawPost } from "../../models/postTypes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { WithId } from "mongodb"
import { mapPostToOutput } from "../../models/mapPostToOutput"
import { postsQueryService } from "../../domain/posts.query.service"
import { likesQueryService } from "../../../likes/domain/likes.query.service"
import { LikeStatus } from "../../../likes/models/likes-types"
import { mapLikeToOutput } from "../../../likes/models/mapLikeToOutput"

export const readPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id.toString()
        
        if (req.user) {
            var userId = req.user._id.toString()
        }

        const foundPost: WithId<RawPost> = await postsQueryService.findPostById(postId)

        let status: LikeStatus | null = LikeStatus.None
        
        if (userId) {
            status = await likesQueryService.getUserStatus(postId, userId)
        
            if (!status) {
                status = LikeStatus.None
            }
        }

        const rawPostLikes = await likesQueryService.getAllEntityLikesWithStatus(postId, LikeStatus.Like)
        const viewPostLikes = rawPostLikes.map(l => mapLikeToOutput(l)).slice(0, 3)

        res.status(HTTPStatusCode.OK).send(mapPostToOutput(foundPost, status, viewPostLikes))
    }
    catch(e) {
        errorsHandler(e, res)
    }
}