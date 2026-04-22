import { Router } from "express"
import { idValidation } from "../../core/middlewares/validation/idValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authGuardMiddleware } from "../../core/middlewares/validation/authGuardMiddleware"
import { paginationAndSortingValidation } from "../../core/middlewares/validation/queryPaginationValidationMiddleware"
import { UserSortAttributes } from "../models/userTypes"
import { userDtoValidationMiddleware } from "../validation/userDtoValidationMiddleware"
import { readAllUsers } from "./handlers/readAllUsersHandler"
import { createUser } from "./handlers/createUserHandler"
import { deleteUserById } from "./handlers/deleteUserByIdHandler"

export const usersRouter = Router()

usersRouter
    .get("/", authGuardMiddleware, paginationAndSortingValidation(UserSortAttributes), inputValidationResultMiddleware, readAllUsers)
    .post("/", authGuardMiddleware, userDtoValidationMiddleware, inputValidationResultMiddleware, createUser)
    .delete("/:id", authGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteUserById)