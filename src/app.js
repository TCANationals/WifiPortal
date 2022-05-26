const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const { getCurrentInvoke } = require('@vendia/serverless-express')
const ejs = require('ejs').__express
const dynamoose = require("dynamoose")
const app = express()
const routes = require("./routes")

app.set('view engine', 'ejs')
app.engine('.ejs', ejs)

app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

// Serve static files in dev (see lambda-static for prod)
app.use('/static', express.static(path.join(__dirname, 'static'), {acceptRanges: false, immutable: true, maxAge: 300000}))

app.use('/', routes)

// Export your express server so you can import it in the lambda function.
module.exports = app
