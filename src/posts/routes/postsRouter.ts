import { Router } from "express"
import { readAllPosts } from "./handlers/readAllPostsHandler"
import { readPostById } from "./handlers/readPostByIdHandler"
import { createPost } from "./handlers/createPostHandler"
import { updatePostById } from "./handlers/updatePostByIdHandler"
import { deletePostById } from "./handlers/deletePostByIdHandler"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { postDtoValidationMiddleware } from "../validation/postDtoValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authGuardMiddleware } from "../../auth/authGuardMiddleware"
import { paginationAndSortingValidation } from "../../core/middlewares/validation/queryPaginationValidationMiddleware"
import { PostSortAttributes } from "../models/postTypes"

export const postsRouter = Router()

postsRouter
    .get("/", paginationAndSortingValidation(PostSortAttributes), readAllPosts)
    .get("/:id", idValidation, inputValidationResultMiddleware, readPostById)
    .post("/", authGuardMiddleware, postDtoValidationMiddleware, inputValidationResultMiddleware, createPost)
    .put("/:id", authGuardMiddleware, idValidation, postDtoValidationMiddleware, inputValidationResultMiddleware, updatePostById)
    .delete("/:id", authGuardMiddleware, idValidation, inputValidationResultMiddleware, deletePostById)