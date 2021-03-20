
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const next = require('next')
const https = require('https');
const { parse } = require("url");

const fs = require('fs')
const { initMinter } = require('./src/api/NFT');

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()
const app = express();
var cors = require('cors')
app.use(cors({ origin: "*" }))
app.use(fileUpload());
app.use(express.static('public'))

// TODO: DO THE REQUEST HANDLER FOR NEXT

if (!process.env.SECRET) throw new Error('No treasury wallet supplied, aborting...');
nextApp.prepare().then(() => {
  console.log("Next app prepared");
  // initMinter(process.env.SECRET).then(() => {
  //   console.log("Minter prepped");
  // }) 

  https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  }, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => console.log('Server Started...'));
})
