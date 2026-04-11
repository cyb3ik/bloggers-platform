import { Request, Response } from "express"
import { HTTPStatusCode } from "../../../core/utils/status-codes"
import { mapUserToOutput } from "../../models/mapUserToOutput"
import { errorsHandler } from "../../../core/errors/errors-handler"
import { matchedData } from "express-validator"
import { paginationSetDefaults } from "../../../core/pagination/paginationSetDefaults"
import { PaginationUserQuery } from "../../models/userTypes"
import { usersQueryService } from "../../domain/users.query.service"

export const readAllUsers = async (req: Request, res: Response) => {
try {
        const sanitizedQuery = matchedData<PaginationUserQuery>(req, {
            locations: ['query'],
            includeOptionals: true
        })

        const inputQuery = paginationSetDefaults(sanitizedQuery)

        const {items, totalCount} = await usersQueryService.findAll(inputQuery)

        const result = {
            pagesCount: Math.ceil(totalCount / inputQuery.pageSize),
            page: inputQuery.pageNumber,
            pageSize: inputQuery.pageSize,
            totalCount: totalCount,
            items: items.map((item) => {
                return mapUserToOutput(item)
            })
        }

        res.status(HTTPStatusCode.OK).send(result)
    }
    catch(e) {
        errorsHandler(e, res)
    }
}