const express = require('express');
const fileUpload = require('express-fileupload');
const querystring = require('querystring');
const url = require('url');
var uuidv4 = require('uuid/v4');
const next = require('next')

const fs = require('fs')
const genThumbnail = require('simple-thumbnail')
const { initMinter, stopMinter, mintNFT, getNFT } = require('./src/NFT');

require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()
const app = express();
var cors = require('cors')
app.use(cors({ origin: "*"}))
app.use(fileUpload());
app.use(express.static('public'))

// TODO: DO THE REQUEST HANDLER FOR NEXT

if(!process.env.SECRET) throw new Error('No treasury wallet supplied, aborting...');
nextApp.prepare().then(() => {
  console.log("Next app prepared");
  // initMinter(process.env.SECRET).then(() => {
  //   console.log("Minter prepped");

        // Don't remove. Important for the server to work. Default route.
        app.get('*', (req, res) => {
          console.log("Resolving request")
          return handle(req, res);
        });

    const mockNFTS = {
        tokens: [
            {
                name: "DTLA_1", // Marker is irrelevant
                location:{
                    lat: 34.0407,
                    lng: 118.2468
                },
                thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
            },
            {
              name: "DTLA_2", // Marker is irrelevant
              location:{
                  lat: 34.0417,
                  lng: 118.2478
              },
              thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
          },
          {
              name: "DTLA_3", // Marker is irrelevant
              location:{
                  lat: 34.039,
                  lng: 118.2458
              },
              thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
          }
        ]
    }

    app.get('/get', (req, res) => {

      let parsedUrl = url.parse(req.url);
      let { lat, lng, max } = querystring.parse(parsedUrl.query);
      console.log("Received get request with lat long max", lat, lng, max);
      return res.status(200).send(JSON.stringify(mockNFTS));
    })
    
    // Upload Endpoint
    app.post('/upload', (req, res) => {
      console.log("Upload file request received");
      if (req.files === null) {
        console.log("No file uploaded");

        return res.status(400).json({ msg: 'No file uploaded' });
      }

      const file = req.files.file;
      const fileName =  uuidv4() + '.webm';
      file.name = fileName

      file.mv(`${__dirname}/public/uploads/${fileName}`, async err => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }

        genThumbnail(`${__dirname}/public/uploads/${fileName}`, `${__dirname}/public/uploads/${fileName.replace('webm','png')}`, '512x?')

        const nftResponse = await mintNFT(fileName);
        console.log("**** NFT MINTED");
        if(!nftResponse) {
          return res.status(500).json({ msg: 'Failed to mint token, try again soon.' });
        }
        console.log(nftResponse);

        // TODO: Change the thumbnail URL as it is currently hardcoded
        res.json({
          ...nftResponse,
          thumbnailUrl: `/uploads/${fileName.replace('webm','png')}`
        });
      });
    });

    app.listen(3000, () => console.log('Server Started...'));

  })
// })