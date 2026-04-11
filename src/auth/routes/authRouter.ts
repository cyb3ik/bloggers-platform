import { Router } from "express"
import { authInputValidationMiddleware } from "../validation/authInputValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authHandler } from "./handlers/authHandler"
import { tokenMiddleware } from "../../core/middlewares/validation/tokenMiddleware"
import { mePageHandler } from "./handlers/mePageHandler"


export const authRouter = Router()

authRouter
    .post("/login", authInputValidationMiddleware, inputValidationResultMiddleware, authHandler)
    .get("/me", tokenMiddleware, mePageHandler)