import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"
import { PaginationCommentQuery } from "../../../comments/models/commentTypes"
import { postsQueryService } from "../../domain/posts.query.service"
import { mapCommentToOutput } from "../../../comments/models/mapCommentToOutput"

export const readCommentsFromPost = async (req: Request, res: Response) => {
    try {
        const sanitizedQuery = matchedData<PaginationCommentQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const { items, totalCount } = await postsQueryService.findPostComments(String(req.params.postId), inputQuery)

        const result = {
            pagesCount: Math.ceil(totalCount / inputQuery.pageSize),
            page: inputQuery.pageNumber,
            pageSize: inputQuery.pageSize,
            totalCount: totalCount,
            items: items.map( (item) => {
                return mapCommentToOutput(item)
            })
        }

        res.status(HTTPStatusCode.OK).send(result)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}