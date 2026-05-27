import { Router } from "express"
import { readAllPosts } from "./handlers/readAllPostsHandler"
import { readPostById } from "./handlers/readPostByIdHandler"
import { createPost } from "./handlers/createPostHandler"
import { updatePostById } from "./handlers/updatePostByIdHandler"
import { deletePostById } from "./handlers/deletePostByIdHandler"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { postDtoValidationMiddleware } from "../validation/postDtoValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authGuardMiddleware } from "../../core/middlewares/validation/authGuardMiddleware"
import { paginationAndSortingValidation } from "../../core/middlewares/validation/queryPaginationValidationMiddleware"
import { PostSortAttributes } from "../models/postTypes"
import { postIdValidation } from "../../core/middlewares/validation/postIdValidationMiddleware"
import { CommentSortAttributes } from "../../comments/models/commentTypes"
import { commentDtoValidationMiddleware } from "../../comments/validation/commentDtoValidationMiddleware"
import { readCommentsFromPost } from "./handlers/readCommentsFromPost"
import { createCommentForPost } from "./handlers/createCommentForPost"
import { accessTokenMiddleware } from "../../core/middlewares/validation/accessTokenMiddleware"
import { unauthAccessTokenMiddleware } from "../../core/middlewares/validation/unauthAccessTokenMiddleware"
import { commentIdValidation } from "../../core/middlewares/validation/commentIdValidationMiddleware"
import { likeStatusValidation } from "../../comments/validation/likeStatusValidationMiddleware"
import { likePostById } from "./handlers/likePostByIdHandler"

export const postsRouter = Router()

postsRouter
    .get("/", unauthAccessTokenMiddleware, paginationAndSortingValidation(PostSortAttributes), inputValidationResultMiddleware, readAllPosts)
    .get("/:id", unauthAccessTokenMiddleware, idValidation, inputValidationResultMiddleware, readPostById)

    .put("/:postId/like-status", accessTokenMiddleware, postIdValidation, likeStatusValidation, inputValidationResultMiddleware, likePostById)

    .get("/:postId/comments",  unauthAccessTokenMiddleware, postIdValidation, paginationAndSortingValidation(CommentSortAttributes), inputValidationResultMiddleware, readCommentsFromPost)
    .post("/:postId/comments", accessTokenMiddleware, postIdValidation, commentDtoValidationMiddleware, inputValidationResultMiddleware, createCommentForPost)

    .post("/", authGuardMiddleware, postDtoValidationMiddleware, inputValidationResultMiddleware, createPost)
    .put("/:id", authGuardMiddleware, idValidation, postDtoValidationMiddleware, inputValidationResultMiddleware, updatePostById)
    .delete("/:id", authGuardMiddleware, idValidation, inputValidationResultMiddleware, deletePostById)