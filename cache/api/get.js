import { getNearestNFTs } from '../../src/api/NFT';

const querystring = require('querystring');
const url = require('url');

export default async (req, res) => {
  let parsedUrl = url.parse(req.url);
  let { lat, lng, max } = querystring.parse(parsedUrl.query);
  console.log("Received get request with lat long max", lat, lng, max);
  console.log(nearItems)
  return res.status(200).send(nearItems);
}
