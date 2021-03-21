const JSONdb = require('simple-json-db');
const db = new JSONdb(`./data/database.json`);
db.sync()

const getNFTs = ({ lat, lng }, maxCount) => {
  const data = db.JSON(); // copy db into memory
  const closest = [];
  Object.entries(data).forEach(([nftLocation, nft]) => {
    const [nftLat, nftLong] = nftLocation.split(':');

    // todo: make this better
    if(Math.abs(nftLat - lat) < 1 && Math.abs(nftLong - lng) < 1 && closest.length < maxCount - 1) {
      closest.push(nft);
    }
  })
  return closest;
}

/**
 * 
 * @param {object} position
 * @param {number} position.lat latitude
 * @param {number} position.long longitude
 * @param {string} nft wallet address
 * 
 */

const saveNFT = ({ lat, lng }, nft) => {
  db.set(lat + ":" + lng, nft)
}

module.exports = {
  getNFTs,
  saveNFT
}