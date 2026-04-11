import { Router } from "express"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { readCommentById } from "./handlers/readCommentByIdHandler"
import { tokenMiddleware } from "../../core/middlewares/validation/tokenMiddleware"
import { commentDtoValidationMiddleware } from "../validation/commentDtoValidationMiddleware"
import { updateCommentById } from "./handlers/updateCommentByIdHandler"
import { deleteCommentById } from "./handlers/deleteCommentByIdHandler"

export const commentsRouter = Router()

commentsRouter
    .get("/:id", idValidation, inputValidationResultMiddleware, readCommentById)
    .put("/:id", tokenMiddleware, idValidation, commentDtoValidationMiddleware, inputValidationResultMiddleware, updateCommentById)
    .delete("/:id", tokenMiddleware, idValidation, inputValidationResultMiddleware, deleteCommentById)