import { Response } from 'express'
import { HTTPStatusCode } from "../utils/status-codes"
import { createErrorsMessages } from "./errors-utils"
import { NotFoundError } from "./not-found-error"
import { NotUniqueError } from './not-unique-error'
import { AlreadyConfirmedError } from './confirmation-error'

export const errorsHandler = (e: unknown, res: Response): void => {
    if (e instanceof NotFoundError) {
        res.status(HTTPStatusCode.NOT_FOUND).send(createErrorsMessages(
            [
                {
                    message: e.message,
                    field: 'id'
                }
            ]
        ))
    }

    if (e instanceof AlreadyConfirmedError) {
        res.status(HTTPStatusCode.BAD_REQUEST).send(createErrorsMessages(
            [
                {
                    message: e.message,
                    field: 'email'
                }
            ]
        ))
    }

    if (e instanceof NotUniqueError) {
        res.status(HTTPStatusCode.BAD_REQUEST).send(createErrorsMessages(
            [
                {
                    message: e.message,
                    field: 'login or email'
                }
            ]
        ))
    }
    else {
        res.sendStatus(HTTPStatusCode.INTERNAL_SERVER_ERROR)
    }
}