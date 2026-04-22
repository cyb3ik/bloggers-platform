import express from "express"
import { setupApp } from "./setup-app"
import { runDB } from "./db/mongo.db"
import { mongoUrl } from "./core/settings/config"
import { PORT } from "./core/settings/config"

const bootstrap = async () => {
    const app = express()
    setupApp(app)

    if (!mongoUrl) {
        throw new Error('Cannot access database')
    }

    await runDB(mongoUrl)

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`)
    })

}

bootstrap()