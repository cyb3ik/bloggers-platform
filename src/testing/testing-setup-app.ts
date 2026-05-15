import cookieParser from "cookie-parser"
import express, { Express, Request, Response } from "express"
import { HTTPStatusCode } from "../core/utils/status-codes"
import { AUTH_PATH, BLOGS_PATH, COMMENTS_PATH, POSTS_PATH, SESSIONS_PATH, TESTING_PATH, USERS_PATH } from "../core/settings/config"
import { postsRouter } from "../posts/routes/postsRouter"
import { blogsRouter } from "../blogs/routes/blogsRouter"
import { testingRouter } from "./testingRouter"
import { usersRouter } from "../users/routes/usersRouter"
import { commentsRouter } from "../comments/routes/commentsRouter"
import { authRouter } from "../auth/routes/authRouter"
import { sessionRouter } from "../core/device-sessions/routes/sessionsRouter"


export const testingSetup = (app: Express) => {
    app.set('trust proxy', true)
    app.use(express.json())
    app.use(cookieParser())

    app.get("/", (req: Request, res: Response) => {
          res.status(HTTPStatusCode.OK).send("App is in testing mode");
    });

    app.use(POSTS_PATH, postsRouter)
    app.use(BLOGS_PATH, blogsRouter)
    app.use(TESTING_PATH, testingRouter)
    app.use(USERS_PATH, usersRouter)
    app.use(COMMENTS_PATH, commentsRouter)
    app.use(AUTH_PATH, authRouter)
    app.use(SESSIONS_PATH, sessionRouter)
    
    return app
}