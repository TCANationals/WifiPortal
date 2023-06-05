process.env.AWS_REGION = 'us-east-1'

const app = require('./src/app')
const port = 4009

app.listen(port)
console.info(`listening on http://localhost:${port}`)
