const express = require('express');
const mongoose = require('mongoose');
const {google} = require('googleapis');
const cors = require('cors')
const Admin = require("./models/Admin")

require('dotenv').config()

/////////////////////////
mongoose.connect(process.env.MONGO_ENDPOINT, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology:true});

/////////////////////////////

app = express();

app.use(cors())
app.use(express.json());

///////////////////////////////////
let oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL_ONLINE
  );
  
  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/spreadsheets'
  ];
  
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
  });

  const user_info = google.oauth2('v2')
///////////////////////////////////

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("API is up and running on port", port)
});

app.get("/", (req, res) => {
    return res.json({"status": "API is running"})
});

app.get("/auth_url", (req, res) => {
    return res.json({"status": true, "url": url}) 
});

app.get("/oauth_token", async (req, res) => {
    try {
        const code = req.query.code
        const {tokens} = await oauth2Client.getToken(code)
        return res.json({"status": true, "tokens": tokens})            
    } catch (error) {
        console.log(error)
        return res.json({"status": false})
    }
 });

 app.get("/user_info", async (req, res) => {
    const tokens = req.query.tokens
    console.log(tokens)
    auth = oauth2Client.setCredentials(JSON.parse(tokens));
    let data = await user_info.userinfo.get({auth: oauth2Client})
    res.json({"status": true, "user": data})
 })

 app.get("/data", async (req, res) => {
    const tokens = req.query.tokens
    auth = oauth2Client.setCredentials(JSON.parse(tokens));
    values = await getData(oauth2Client, req.query.spreadsheet_id, req.query.spreadsheet_range)
    return res.json({"status": true, "data": values})
 })

async function getData(auth, SPREADSHEET_ID, RANGE) {
    const sheets = google.sheets({version: 'v4', auth: auth});
    const request = {
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE
    }
    const response = await sheets.spreadsheets.values.get(request)

    return response.data
  }

  app.get("/admin", async (req, res) => {
    const data = req.query
    let admin = await Admin.findOne(req.query).exec()
    if(admin)
    {
        res.json({"status": true, admin: admin})
    }
    else
    {
        res.json({"status": false, message: "No admin with the criteria found"})
    }
  })

  app.post("/admin", async (req, res) => {
      const data = req.body
      if(data["superAdminPassword"] === process.env.SUPER_ADMIN_PASSWORD)
      {
          let insertedAdmin = await Admin(req.body).save()
          res.json({"status": true, admin: insertedAdmin})
      }
      else
      {
        res.json({"status": false, message: "You don't have the necessary credentials to create an admin"})
    }
  })

