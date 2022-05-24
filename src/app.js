const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const { getCurrentInvoke } = require('@vendia/serverless-express')
const ejs = require('ejs').__express
const app = express()
const router = express.Router()

const wifiGuestUser = 'guestUser'
const wifiGuestPass = '1234567890'

app.set('view engine', 'ejs')
app.engine('.ejs', ejs)

router.use(compression())
router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')))

router.post('/_login', (req, res) => {
  const body = req.body
  const email = body.email
  let status = true
  if (email == undefined || email == "") {
    status = false
  }
  if (status) {
    res.json({
      status: status,
      user: wifiGuestUser,
      pass: wifiGuestPass,
      body: body,
    })
  } else {
    res.json({status: status})
  }
})

router.get('*', (req, res) => {
  res.render('index', {
    req
  })
})

app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
