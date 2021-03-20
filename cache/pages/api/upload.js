
require('dotenv').config();
var uuidv4 = require('uuid/v4');
const fs = require('fs')
const genThumbnail = require('simple-thumbnail')
const { initMinter, stopMinter, mintNFT, getNFT, createSignInRequest } = require('../../src/api/NFT');

initMinter(process.env.SECRET).then(() => {
  console.log("Minter prepped");
})

export default (req, res) => {
  console.log("Upload file request received");
  if (req.files === null) {
    console.log("No file uploaded");

    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;
  const fileName = uuidv4() + '.webm';
  file.name = fileName

  file.mv(`${__dirname}/public/uploads/${fileName}`, async err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    await genThumbnail(`${__dirname}/public/uploads/${fileName}`, `${__dirname}/public/uploads/${fileName.replace('webm', 'png')}`, '512x?')
    console.log(" CREATING NFT DATA:")
    console.log(req.body)
    const nftData = {
      location: req.body.location,
      media: fs.readFileSync(`${__dirname}/public/uploads/${fileName}`),
      thumbnail: fs.readFileSync(`${__dirname}/public/uploads/${fileName.replace('webm', 'png')}`),
      metadata: '' // if we want like text or whatever
    }

    const nftResponse = await mintNFT(nftData, req.body.user_token);
    console.log("**** NFT MINTED");
    if (!nftResponse) {
      return res.status(500).json({ msg: 'Failed to mint token, try again soon.' });
    }
    console.log(nftResponse);
    await fs.rm(`${__dirname}/public/uploads/${fileName}`);
    await fs.rm(`${__dirname}/public/uploads/${fileName.replace('webm','png')}`);

    // TODO: Change the thumbnail URL as it is currently hardcoded
    res.json({
      ...nftResponse,
      thumbnailUrl: `/uploads/${fileName.replace('webm', 'png')}`
    });
  });
}