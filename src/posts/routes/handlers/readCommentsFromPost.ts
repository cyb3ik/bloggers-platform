import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"
import { PaginationCommentQuery } from "../../../comments/models/commentTypes"
import { postsQueryService } from "../../domain/posts.query.service"
import { mapCommentToOutput } from "../../../comments/models/mapCommentToOutput"
import { likesQyRepository } from "../../../likes/repositories/likesQyRepository"
import { LikeStatus } from "../../../likes/models/likes-types"
import { likesQueryService } from "../../../likes/domain/likes.query.service"

export const readCommentsFromPost = async (req: Request, res: Response) => {
    try {
        
        if (req.user) {
            var userId = req.user._id.toString()
        }

        const sanitizedQuery = matchedData<PaginationCommentQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const { items, totalCount } = await postsQueryService.findPostComments(String(req.params.postId), inputQuery)

        const mappedItems = []
        
        for (let item of items) {
            if (userId) {
                const userStatus = await likesQueryService.getUserStatus(item._id.toString(), userId)

                if (!userStatus) {
                    let mappedItem = mapCommentToOutput(item, LikeStatus.None)
                    mappedItems.push(mappedItem)
                }
                else {
                    let mappedItem = mapCommentToOutput(item, userStatus)
                    mappedItems.push(mappedItem)
                }
            } else {
                let mappedItem = mapCommentToOutput(item, LikeStatus.None)
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