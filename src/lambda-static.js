// This file is a standalone static asset server
// to ensure performance when serving static assets

require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
const path = require('path')
const express = require('express')
const app = express()

// Serve static files
app.use('/static', express.static(
    path.join(__dirname, 'static'),
    { acceptRanges: false, immutable: true, maxAge: 300000 }))

// Export your express server so you can import it in the lambda function.
exports.handler = serverlessExpress({ app })
