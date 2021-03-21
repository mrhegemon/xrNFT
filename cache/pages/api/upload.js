
require('dotenv').config();
var uuidv4 = require('uuid/v4');
const fs = require('fs')
const genThumbnail = require('simple-thumbnail')
import nextConnect from 'next-connect';
const { initMinter, stopMinter, mintNFT, getNearestNFTs } = require('../../src/api/NFT');
import multer from 'multer';
let minterPrepped = false;

// Returns a Multer instance that provides several methods for generating 
// middleware that process files uploaded in multipart/form-data format.
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
      cb(null, "video.webm");
    }
  }),
});

const apiRoute = nextConnect();


apiRoute.post(upload.single('video'), async (req, res) => {

console.log("FILE IS")
console.log(req.file);

  if(!minterPrepped){
    await initMinter().then(() => {
      console.log("Minter prepped");
      minterPrepped = true;
    })
  }


  console.log("Upload file request received");
  if (!req.file) {
    console.log("No file uploaded");

    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const fileName = uuidv4() + '.webm';

  console.log("Filename is", fileName)

  const file = req.file;

  console.log("File is", file);
  file.name = fileName

  console.log("Dirname is", __dirname);
  console.log("Filename is", `./public/uploads/${fileName}`);

  fs.readdir(`./public/uploads`, (err, files) => {
    if(err) console.error(err);
    files.forEach(file => {
      console.log(file);
    });
  });

  fs.renameSync(`./public/uploads/video.webm`, `./public/uploads/${fileName}`)

    let ipfsHash;
    try { 
      console.log("CWD is", process.cwd());

      await genThumbnail(`${process.cwd()}/public/uploads/${fileName}`, `${process.cwd()}/public/uploads/${fileName.replace('webm', 'png')}`, '512x?').catch(err => {
        console.log(err);
      })
      console.log(" CREATING NFT DATA:")
      console.log("Location is ", req.location);
      console.log("Location could also be ", req.body.location);

      const nftData = {
        location: req.body.location,
        media: fs.readFileSync(`./public/uploads/${fileName}`),
        thumbnail: fs.readFileSync(`./public/uploads/${fileName.replace('webm', 'png')}`),
        metadata: '' // if we want like text or whatever
      }
      
      ipfsHash = await mintNFT(nftData);
      
      fs.rmSync(`./public/uploads/${fileName}`);
      fs.rmSync(`./public/uploads/${fileName.replace('webm','png')}`);
    } catch (e) {
      console.log(e)
    }
    
    console.log('ipfsHash', ipfsHash);
    
    if (!ipfsHash) {
      return res.status(500).json({ msg: 'Failed to mint token, try again soon.' });
    }
    res.status(200).json({
      ipfsHash,
    });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
}