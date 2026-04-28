import { Router } from "express"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { readCommentById } from "./handlers/readCommentByIdHandler"
import { commentDtoValidationMiddleware } from "../validation/commentDtoValidationMiddleware"
import { updateCommentById } from "./handlers/updateCommentByIdHandler"
import { deleteCommentById } from "./handlers/deleteCommentByIdHandler"
import { accessTokenMiddleware } from "../../core/middlewares/validation/accessTokenMiddleware"

export const commentsRouter = Router()

commentsRouter
    .get("/:id", idValidation, inputValidationResultMiddleware, readCommentById)
    .put("/:id", accessTokenMiddleware, idValidation, commentDtoValidationMiddleware, inputValidationResultMiddleware, updateCommentById)
    .delete("/:id", accessTokenMiddleware, idValidation, inputValidationResultMiddleware, deleteCommentById)