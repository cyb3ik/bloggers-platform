import { Router } from "express"
import { authInputValidationMiddleware } from "../validation/authInputValidationMiddleware"
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/inputValidationResultMiddleware"
import { authHandler } from "./handlers/authHandler"
import { accessTokenMiddleware } from "../../core/middlewares/validation/accessTokenMiddleware"
import { mePageHandler } from "./handlers/mePageHandler"
import { registerHandler } from "./handlers/registerHandler"
import { userDtoValidationMiddleware } from "../../users/validation/userDtoValidationMiddleware"
import { codeValidation } from "../validation/codeValidation"
import { confirmationHandler } from "./handlers/confirmationHandler"
import { emailValidation } from "../validation/emailValidation"
import { resendHandler } from "./handlers/resendHandler"
import { refreshTokenMiddleware } from "../../core/middlewares/validation/refreshTokenMiddleware"
import { refreshHandler } from "./handlers/refreshHandler"
import { logOutHandler } from "./handlers/logOutHandler"
import { rateLimitMiddleware } from "../../core/middlewares/requestsRate/rateLimitMiddleware"
import { recoveryHandler } from "./handlers/recoveryHandler"
import { recoveryConfirmationHandler } from "./handlers/recoveryConfirmationHandler"
import { newPasswordValidation } from "../validation/newPasswordValidation"


export const authRouter = Router()

authRouter
    .post("/login", rateLimitMiddleware, authInputValidationMiddleware, inputValidationResultMiddleware, authHandler)
    
    .post("/registration", rateLimitMiddleware, userDtoValidationMiddleware, inputValidationResultMiddleware, registerHandler)
    .post("/registration-confirmation", rateLimitMiddleware, codeValidation, inputValidationResultMiddleware, confirmationHandler)
    .post("/registration-email-resending", rateLimitMiddleware, emailValidation, inputValidationResultMiddleware, resendHandler)

    .post("/password-recovery", rateLimitMiddleware, emailValidation, inputValidationResultMiddleware, recoveryHandler)
    .post("/new-password", rateLimitMiddleware, newPasswordValidation, inputValidationResultMiddleware, recoveryConfirmationHandler)

    .post("/refresh-token", refreshTokenMiddleware, refreshHandler)
    .post("/logout", refreshTokenMiddleware, logOutHandler)

    .get("/me", accessTokenMiddleware, mePageHandler)