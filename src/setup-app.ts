import express, { Express, Request, Response } from "express"
import { blogsRouter } from "./blogs/routes/blogsRouter"
import { postsRouter } from "./posts/routes/postsRouter"
import { testingRouter } from "./testing/testingRouter"
import { HTTPStatusCode } from "./core/utils/status-codes"
import { TESTING_PATH, POSTS_PATH, BLOGS_PATH, USERS_PATH, AUTH_PATH, COMMENTS_PATH } from "./core/settings/config"
import { usersRouter } from "./users/routes/usersRouter"
import { authRouter } from "./auth/routes/authRouter"
import { commentsRouter } from "./comments/routes/commentsRouter"
 
export const setupApp = (app: Express) => {
    app.use(express.json())

    app.get("/", (req: Request, res: Response) => {
          res.status(HTTPStatusCode.OK).send("Hello World!");
    });

    app.use(POSTS_PATH, postsRouter)
    app.use(BLOGS_PATH, blogsRouter)
    app.use(TESTING_PATH, testingRouter)
    app.use(USERS_PATH, usersRouter)
    app.use(COMMENTS_PATH, commentsRouter)
    app.use(AUTH_PATH, authRouter)
    
    return app
}