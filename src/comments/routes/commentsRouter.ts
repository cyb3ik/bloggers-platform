import { Router } from "express"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { readCommentById } from "./handlers/readCommentByIdHandler"
import { commentDtoValidationMiddleware } from "../validation/commentDtoValidationMiddleware"
import { updateCommentById } from "./handlers/updateCommentByIdHandler"
import { deleteCommentById } from "./handlers/deleteCommentByIdHandler"
import { accessTokenMiddleware } from "../../core/middlewares/validation/accessTokenMiddleware"
import { likeCommentById } from "./handlers/likeCommentByIdHandler"
import { commentIdValidation } from "../../core/middlewares/validation/commentIdValidationMiddleware"
import { likeStatusValidation } from "../validation/likeStatusValidationMiddleware"
import { unauthAccessTokenMiddleware } from "../../core/middlewares/validation/unauthAccessTokenMiddleware"

export const commentsRouter = Router()

commentsRouter
    .get("/:id", unauthAccessTokenMiddleware, idValidation, inputValidationResultMiddleware, readCommentById)
    .put("/:id", accessTokenMiddleware, idValidation, commentDtoValidationMiddleware, inputValidationResultMiddleware, updateCommentById)
    .put("/:commentId/like-status", accessTokenMiddleware, commentIdValidation, likeStatusValidation, inputValidationResultMiddleware, likeCommentById)
    .delete("/:id", accessTokenMiddleware, idValidation, inputValidationResultMiddleware, deleteCommentById)