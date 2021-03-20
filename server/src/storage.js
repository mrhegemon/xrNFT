const JSONdb = require('simple-json-db');
const db = new JSONdb('/database.json');

const getNFTs = ({ lat, long }, maxCount) => {
  console.log('getNFTs', lat, long, maxCount);
  const data = db.JSON(); // copy db into memory
  const closest = [];
  // cheap hack to return them all for now
  Object.entries(data).forEach((nft, location) => {
    const [lat, long] = location.split(':');
    closest.push(nft);
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

const saveNFT = ({ lat, long }, nft) => {
  db.set(lat + ":" + long, nft)
  db.sync()
}

module.exports = {
  getNFTs,
  saveNFT
}