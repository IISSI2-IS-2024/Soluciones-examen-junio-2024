import express from 'express'
import dotenv from 'dotenv'
import loadRoutes from './routes/index.js'
import { initPassport } from './config/passport.js'
import { initSequelize, disconnectSequelize } from './config/sequelize.js'
import loadGlobalMiddlewares from './middlewares/GlobalMiddlewaresLoader.js'

const initializeApp = async () => {
  dotenv.config()
  const app = express()
  loadGlobalMiddlewares(app)
  loadRoutes(app)
  initPassport()
  app.connection = await initializeDatabase()
  await postInitializeDatabase(app)
  return app
}

const initializeServer = async (enableConsoleLog = false) => {
  controlConsoleLog(enableConsoleLog)
  try {
    const app = await initializeApp()
    const port = process.env.APP_PORT || 3000
    const server = await app.listen(port)
    console.log('DeliverUS listening at http://localhost:' + server.address().port)
    return { server, app }
  } catch (error) {
    console.error(error)
  }
}

const initializeDatabase = async () => {
  let connection
  try {
    connection = await initSequelize()
    console.log('INFO - Relational/MariaDB/Sequelize technology connected.')
  } catch (error) {
    console.error(error)
  }
  return connection
}

const disconnectDatabase = async (app) => {
  try {
    await disconnectSequelize(app.connection)
    console.log('INFO - Relational/MariaDB/Sequelize technology disconnect.')
  } catch (error) {
    console.error(error)
  } finally {
    controlConsoleLog(true)
  }
}

const controlConsoleLog = (enable) => {
  if (!enable) {
    global.originalConsoleLog = console.log
    console.log = () => {}
  } else {
    console.log = global.originalConsoleLog || console.log
  }
}

const postInitializeDatabase = async (app) => {
  // To be used for future requirements
}

export { initializeApp, disconnectDatabase, initializeServer }
