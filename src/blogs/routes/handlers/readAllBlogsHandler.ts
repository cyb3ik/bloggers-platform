import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { blogsService } from "../../application/blogs.service"
import { PaginationBlogQuery} from "../../models/blogTypes"
import { mapBlogToOutput } from "../../models/mapBlogToOutput"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"

export async function readAllBlogs(req: Request, res: Response) {
    try {
        const sanitizedQuery = matchedData<PaginationBlogQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const {items, totalCount} = await blogsService.findAll(inputQuery)

        const result = {
            pagesCount: Math.ceil(totalCount / inputQuery.pageSize),
            page: inputQuery.pageNumber,
            pageSize: inputQuery.pageSize,
            totalCount: totalCount,
            items: items.map((item) => {
                return mapBlogToOutput(item)
            })
        }

        res.status(HTTPStatusCode.OK).send(result)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}