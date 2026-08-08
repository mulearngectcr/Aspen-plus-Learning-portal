import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.log(`Chem-E API listening on port ${env.port}`)
})
