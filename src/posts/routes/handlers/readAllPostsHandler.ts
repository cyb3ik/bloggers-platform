import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { PaginationPostQuery, RawPost } from "../../models/postTypes"
import { mapPostToOutput } from "../../models/mapPostToOutput"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"
import { postsQueryService } from "../../domain/posts.query.service"

export const readAllPosts = async (req: Request, res: Response) => {
try {
        const sanitizedQuery = matchedData<PaginationPostQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const {items, totalCount} = await postsQueryService.findAll(inputQuery)

        const result = {
            pagesCount: Math.ceil(totalCount / inputQuery.pageSize),
            page: inputQuery.pageNumber,
            pageSize: inputQuery.pageSize,
            totalCount: totalCount,
            items: items.map((item) => {
                return mapPostToOutput(item)
            })
        }

        res.status(HTTPStatusCode.OK).send(result)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}