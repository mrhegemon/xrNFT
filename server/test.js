require('dotenv').config();
const nft = require('../cache/NFT');

const fake_user_token = '128ffdc8-4345-4254-a024-251514f347c2';
let i = 0;
const randomLocation = () => { return { lat: (Math.random()*180)-90, long: (Math.random()*360)-180 }; }
const metadata = () => { i++; return { location: randomLocation(), thumbnail: 'https://notathumbnail.com/'+i, media: 'https://notmedia.com/'+i, metadata: 'no thanks '+i }; };


nft.initMinter(process.env.SECRET).then(async () => {
  let time = Date.now();
  await nft.mintNFT(metadata(), fake_user_token)
  console.log(Date.now() - time);
  time = Date.now();
  await nft.mintNFT(metadata(), fake_user_token)
  console.log(Date.now() - time);
  time = Date.now();
  await nft.mintNFT(metadata(), fake_user_token)
  console.log(Date.now() - time);
  time = Date.now();
  await nft.mintNFT(metadata(), fake_user_token)
  console.log(Date.now() - time);
  time = Date.now();
  const results = await nft.getNFT(3)
  if(results.length) {
    process.exit(0)
  } else {
    process.exit(-1);
  }
})