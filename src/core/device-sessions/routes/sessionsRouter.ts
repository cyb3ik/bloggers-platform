import { Router } from "express"
import { refreshTokenMiddleware } from "../../middlewares/validation/refreshTokenMiddleware"
import { readAllUserSessions } from "./handlers/readAllUserSessionsHandler"
import { deleteAllUserSessionsExceptCurrent } from "./handlers/deleteAllUserSessionsExceptCurrentHandler"
import { deleteSpecifiedDeviceSession } from "./handlers/deleteSpecifiedDeviceSessionHandler"



export const sessionRouter = Router()

sessionRouter
    .get("/devices", refreshTokenMiddleware, readAllUserSessions)
    .delete("/devices", refreshTokenMiddleware, deleteAllUserSessionsExceptCurrent)
    .delete("/devices/:deviceId", refreshTokenMiddleware, deleteSpecifiedDeviceSession)