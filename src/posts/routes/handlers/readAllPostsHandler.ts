import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { PaginationPostQuery, RawPost } from "../../models/postTypes"
import { mapPostToOutput } from "../../models/mapPostToOutput"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"
import { postsQueryService } from "../../domain/posts.query.service"
import { likesQueryService } from "../../../likes/domain/likes.query.service"
import { LikeStatus } from "../../../likes/models/likes-types"
import { mapLikeToOutput } from "../../../likes/models/mapLikeToOutput"

export const readAllPosts = async (req: Request, res: Response) => {
    try {
        if (req.user) {
            var userId = req.user._id.toString()
        }

        const sanitizedQuery = matchedData<PaginationPostQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const {items, totalCount} = await postsQueryService.findAllPosts(inputQuery)

        const mappedItems = []
        
        for (let item of items) {
            const rawPostLikes = await likesQueryService.getAllEntityLikesWithStatus(item._id.toString(), LikeStatus.Like)
            const viewPostLikes = rawPostLikes.map(l => mapLikeToOutput(l)).slice(0, 3)
            if (userId) {
                const userStatus = await likesQueryService.getUserStatus(item._id.toString(), userId)

                if (!userStatus) {
                    let mappedItem = mapPostToOutput(item, LikeStatus.None, viewPostLikes)
                    mappedItems.push(mappedItem)
                }
                else {
                    let mappedItem = mapPostToOutput(item, userStatus, viewPostLikes)
                    mappedItems.push(mappedItem)
                }
            } else {
                let mappedItem = mapPostToOutput(item, LikeStatus.None, viewPostLikes)
                mappedItems.push(mappedItem)
            }

        }
        
        const result = {
            pagesCount: Math.ceil(totalCount / inputQuery.pageSize),
            page: inputQuery.pageNumber,
            pageSize: inputQuery.pageSize,
            totalCount: totalCount,
            items: mappedItems
        }

        res.status(HTTPStatusCode.OK).send(result)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}