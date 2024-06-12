import { fileURLToPath } from 'url'
import path from 'path'
import express from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadFileRoutes = function (app) {
  app.use('/public', express.static(path.join(__dirname, '../../public')))// Serves resources from public folder

  app.get('/', (req, res) => {
    res.send('DeliverUS API. Check Repository')
  })
  app.post('/shutdown', (req, res) => {
    console.log('Shutting down server')
    res.sendStatus(200)
    setTimeout(() => {
      process.exit(0)
    }, 1000)
  })
}

export default loadFileRoutes
