'use strict';

var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors')

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

global.res = ""
global.oAuth2Client_G=""

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

const TOKEN_PATH = 'token.json';

app.use(cors())
router.use(cors())


// support on x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(function (req, res, next) {
    // console.log("req.body"); // populated!
    // console.log(req.body); // populated!
    // console.log("req.body"); // populated!
});


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(router);


exports.auth = function (req, res) {
  global.res = res
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content),sendResponse);
      });
}

exports.getList = function (req, res) {
  global.res = res
  let code = req.query.code  

  oAuth2Client_G.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client_G.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    listFiles(oAuth2Client_G);
  });

  
}

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) 
        return getAccessToken(oAuth2Client, callback);

      oAuth2Client.setCredentials(JSON.parse(token));

      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      global.oAuth2Client_G = oAuth2Client
      callback(authUrl);
    });
  }


  function sendResponse(url){
    return global.res.status(200).json({
      message: url,
      isSuccess: true
  });
  }

  function listFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const files = res.data.files;
      if (files.length) {
        return global.res.status(200).json({
          message: files,
          isSuccess: true
      });
      } else {
        console.log('No files found.');
      }
    });
  }



