const JSONdb = require('simple-json-db');
const db = new JSONdb(`${__dirname}/data/database.json`);

const getNFTs = ({ lat, long }, maxCount) => {
  console.log('getNFTs', lat, long, maxCount);
  const data = db.JSON(); // copy db into memory
  const closest = [];
  Object.entries(data).forEach(([nftLocation, nft]) => {
    const [nftLat, nftLong] = nftLocation.split(':');
    // todo: find nearest maxCount and return only them
    closest.push({ location: { lat: nftLat, long: nftLong }, nft });
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