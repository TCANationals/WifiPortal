const app = require('express').Router()
const nodeUrl = require('url')
const dynamoose = require("dynamoose")
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

var cssHash = {
  main : generateChecksum(fs.readFileSync(path.resolve(__dirname, 'static/css/main.css'),'utf8')),
  util : generateChecksum(fs.readFileSync(path.resolve(__dirname, 'static/css/util.css'),'utf8')),
  mainJs : generateChecksum(fs.readFileSync(path.resolve(__dirname, 'static/js/main.js'),'utf8')),
};

const wifiGuestUser = 'susaguest'
const wifiGuestPass = 'Skills2024'
const recordIdPrefix = '2024'

// Setup user model
const userSchema = new dynamoose.Schema({
    "id": String, // mac address of device
    "seen_count": Number,
    //"email": String,
    "user_agent": String,
    "last_ap_mac": String,
    "mac_address": String,
    "last_ip": String,
    "last_apid": String,
    "last_ap_location": String,
    "last_ap_floor": String,
    "last_ap_building": String,
    "last_ssid": String,
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
      userRecord.seen_count = 0
    }
    userRecord.seen_count = (userRecord.seen_count || 0) + 1
    userRecord.user_agent = req.headers['user-agent']
    userRecord.last_ip = body.station_ip
    userRecord.last_ap_mac = body.apmac
    userRecord.last_apid = body.apid
    userRecord.last_ap_location = body.ap_location
    userRecord.last_ap_floor = body.ap_floor
    userRecord.last_ap_building = body.ap_building
    userRecord.last_ssid = body.ssid
    await userRecord.save()
    resp.form.push({k: 'userid', v: wifiGuestUser});
    resp.form.push({k: 'username', v: wifiGuestUser});
    resp.form.push({k: 'password', v: wifiGuestPass});
    resp.form.push({k: 'magic', v: body.magic});
    resp.url = formatPostUrl(body.login_url)
  }
  res.json(resp)
})

app.get('/success', async (req, res) => {
  res.render('success', { cssHash })
})

app.get('*', async (req, res) => {
  let userRecord = await getUserRecord(req.query.usermac)
  let userSeen = 0
  if (userRecord) {
    userSeen = 1
  }
  res.render('index', {
    req, userRecord, userSeen, cssHash
  })
})

async function getUserRecord(mac) {
  const cleanedMac = macFormatter(mac)
  if (!cleanedMac) return
  return User.get(cleanedMac)
}

function formatPostUrl(rawUrl) {
  let url = nodeUrl.parse(rawUrl)
  if (url.protocol == "https:" && url.port == "8081") {
    url.port = "8082"
    url.protocol = "http:"
    url.host = `${url.hostname}:${url.port}`
  }
  return nodeUrl.format(url)
}

function macFormatter(mac) {
  if (mac == undefined || mac == "") {
    return
  }
  const cleanedMac = mac.toLowerCase().replace(/[^a-f0-9]/g, '')
  if (cleanedMac.length == 12) {
    return recordIdPrefix.concat('-', cleanedMac)
  }
  return
}

function generateChecksum(str, algorithm, encoding) {
  return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex');
}

module.exports = app
