const app = require('express').Router()
const dynamoose = require("dynamoose")

const wifiGuestUser = 'guestUser'
const wifiGuestPass = '1234567890'

// Setup user model
const userSchema = new dynamoose.Schema({
    "id": String, // mac address of device
    "email": String,
    "user_agent": String,
    "last_station": String,
}, {
    "saveUnknown": true,
    "timestamps": true
})
const User = dynamoose.model(
  process.env.USER_TABLE || 'ServerlessNlscWifiPortal-UserTable-FEFZRCCQ71U7', userSchema)

app.post('/_login', async (req, res) => {
  const body = req.body
  const email = body.email
  const stationMac = body.station_mac
  let status = true
  if (email == undefined || email == "" || stationMac == undefined || stationMac == "") {
    status = false
  }
  if (status) {
    let userRecord = await getUserRecord(stationMac)
    if (!userRecord || userRecord.id == undefined) {
      userRecord = new User({"id": macFormatter(stationMac)})
    }
    userRecord.email = email
    await userRecord.save()
    res.json({
      status: status,
      user: wifiGuestUser,
      pass: wifiGuestPass,
      body: body,
      user: userRecord,
    })
  } else {
    res.json({status: status})
  }
})

app.get('*', async (req, res) => {
  let userRecord = await getUserRecord(req.query.station_mac)
  res.render('index', {
    req, userRecord
  })
})

async function getUserRecord(mac) {
  const cleanedMac = macFormatter(mac)
  if (!cleanedMac) return
  return User.get(cleanedMac)
}

async function setUserRecord(mac, data) {
  const cleanedMac = macFormatter(mac)
  if (!cleanedMac) return false
}

function macFormatter(mac) {
  if (mac == undefined || mac == "") {
    return
  }
  const cleanedMac = mac.toLowerCase().replace(/[^a-f0-9]/g, '')
  if (cleanedMac.length == 12) {
    return cleanedMac
  }
  return
}

module.exports = app
