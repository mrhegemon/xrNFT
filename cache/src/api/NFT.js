const { create, globSource } = require('ipfs-core');

const { getNFTs, saveNFT } = require('./storage')

let IPFS;

const initMinter = async (secret) => {
  await startIPFS()
}

const stopMinter = async () => {
  await IPFS.stop()
}

const mintNFT = async ({ location, thumbnail, media, metadata }) => {
  const locationObj = JSON.parse(location);
  
  const [thumbnailCID, mediaCID] = await Promise.all([ addToIPFS(thumbnail), addToIPFS(media) ]);
  
  const CID = await addToIPFS(JSON.stringify({ location: locationObj, metadata, thumbnailUrl: thumbnailCID, dataUrl: mediaCID }));
  // const CID_URI = `ipfs://${CID}/`;
  
  saveNFT(locationObj, CID);
  
  return CID;
}


const getNearestNFTs = async (location, maxCount) => {
  return getNFTs(location, maxCount);
}

const startIPFS = async () => {
  IPFS = await create();
}

const addToIPFS = async (dataToUpload, metadata) => {

  console.log('uploading', dataToUpload, 'to ipfs')
  const file = {
    content: dataToUpload,
    path: metadata ? 'metadata.json' : undefined
  };

  const addOptions = {
    pin: true,
    timeout: 300000
  };

  const result = await IPFS.add(file, addOptions);
  return result.cid.toString();
}

module.exports = {
  initMinter,
  stopMinter,
  mintNFT,
  getNearestNFTs,
}