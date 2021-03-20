
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const querystring = require('querystring');
const url = require('url');
var uuidv4 = require('uuid/v4');
const fs = require('fs')
const genThumbnail = require('simple-thumbnail')
const { initMinter, stopMinter, mintNFT, getNFT } = require('../cache/src/NFT');


if(!process.env.SECRET) throw new Error('No treasury wallet supplied, aborting...');

initMinter(process.env.SECRET).then(() => {

  const app = express();
  var cors = require('cors')
  app.use(cors({ origin: "*"}))
  app.use(fileUpload());
  app.use(express.static('public'))

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
    let { location, max } = querystring.parse(parsedUrl.query);
    console.log("Received get request with lat long max", lat, lng, max);
    getNFT(location, max)
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

      const nftResponse = await mintNFT(req.body.location, fileName, req.body.address);
      
      console.log("**** NFT MINTED");
      if(!nftResponse) {
        return res.status(500).json({ msg: 'Failed to mint token, try again soon.' });
      }

      console.log(nftResponse);
      await fs.rm(`${__dirname}/public/uploads/${fileName}`);
      await fs.rm(`${__dirname}/public/uploads/${fileName.replace('webm','png')}`);

      // TODO: Change the thumbnail URL as it is currently hardcoded
      res.json(nftResponse);
    });
  });

  app.listen(5000, () => console.log('Server Started...'));

})