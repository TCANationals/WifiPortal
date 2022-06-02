const app = require('express').Router()
const dynamoose = require("dynamoose")

const wifiGuestUser = 'susaguest'
const wifiGuestPass = 'Skills2022'

// Setup user model
const userSchema = new dynamoose.Schema({
    "id": String, // mac address of device
    //"email": String,
    "user_agent": String,
    "last_ap_mac": String,
    "mac_address": String,
    "last_ip": String,
}, {
    "saveUnknown": true,
    "timestamps": true
})
const User = dynamoose.model(
  process.env.USER_TABLE || 'ServerlessNlscWifiPortal-UserTable-FEFZRCCQ71U7', userSchema)

app.post('/_login', async (req, res) => {
  const body = req.body
  //const email = body.email
  const stationMac = body.station_mac
  let resp = {status: true, form: []}
  if (stationMac == undefined || stationMac == "") {
    resp.status = false
  }
  if (resp.status) {
    let userRecord = await getUserRecord(stationMac)
    if (!userRecord || userRecord.id == undefined) {
      userRecord = new User({"id": macFormatter(stationMac)})
      userRecord.mac_address = stationMac
    }
    userRecord.user_agent = req.headers['user-agent']
    userRecord.last_ip = body.station_ip
    userRecord.last_ap_mac = body.apmac
    await userRecord.save()
    resp.form.push({k: 'userid', v: wifiGuestUser});
    resp.form.push({k: 'username', v: wifiGuestUser});
    resp.form.push({k: 'password', v: wifiGuestPass});
    resp.form.push({k: 'magic', v: body.magic});
    resp.url = body.login_url
  }
  res.json(resp)
})

app.get('*', async (req, res) => {
  let userRecord = await getUserRecord(req.query.usermac)
  res.render('index', {
    req, userRecord
  })
})

async function getUserRecord(mac) {
  const cleanedMac = macFormatter(mac)
  if (!cleanedMac) return
  return User.get(cleanedMac)
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
