import { Router } from "express"
import { readAllBlogs } from "./handlers/readAllBlogsHandler"
import { readBlogById } from "./handlers/readBlogByIdHandler"
import { createBlog } from "./handlers/createBlogHandler"
import { updateBlogById } from "./handlers/updateBlogByIdHandler"
import { deleteBlogById } from "./handlers/deleteBlogByIdHandler"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { blogDtoValidationMiddleware } from "../validation/blogDtoValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authGuardMiddleware } from "../../auth/authGuardMiddleware"
import { readPostsFromBlog } from "./handlers/readPostsFromBlog"
import { postDtoValidationMiddleware } from "../../posts/validation/postDtoValidationMiddleware"
import { createPostForBlog } from "./handlers/createPostForBlog"
import { paginationAndSortingValidation } from "../../core/middlewares/validation/queryPaginationValidationMiddleware"
import { BlogSortAttributes } from "../models/blogTypes"

export const blogsRouter = Router() 

blogsRouter
    .get("", paginationAndSortingValidation(BlogSortAttributes), inputValidationResultMiddleware, readAllBlogs)
    .get("/:id", idValidation, inputValidationResultMiddleware, readBlogById)
    .get("/:id/posts", idValidation, paginationAndSortingValidation(BlogSortAttributes), inputValidationResultMiddleware, readPostsFromBlog)

    .post("/", authGuardMiddleware, blogDtoValidationMiddleware, inputValidationResultMiddleware, createBlog)
    .post("/:id/posts", authGuardMiddleware, postDtoValidationMiddleware, inputValidationResultMiddleware, createPostForBlog)

    .put("/:id", authGuardMiddleware, idValidation, blogDtoValidationMiddleware, inputValidationResultMiddleware, updateBlogById)

    .delete("/:id", authGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteBlogById)