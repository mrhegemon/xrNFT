# LifeCache backend 
## With a web based xrNFT viewer

Immutable memories stored in the world, using the blockchain as a public database.

See your history in 2D/3D art in Immersive worldscale web based AR. LifeCache uses a web based xrNFT viewer that creates NFT GeoCaches of webAR content on the 3D Web app using web location tech accessing, GPS, camera, compass, gyroscope accelerometer, other sensors.

Think pokemon go with videos, 3D models, and pics right from the web.

WebXR + Minting ERC721 and ERC1155 tokens

Works for Android/iOS - Chrome/Safari Mobile

## NFTHack Project

Works for Android/iOS - Chrome/Safari Mobile

### Packages used:

- Truffle / Polygon for  ETH NFT Minter templates 
- IPFS for storage
- AR.js / A-Frame / Three.js for worldscale WebXR
- NEXT.js for app

# Cache Usage

1. User takes photo / video / uploads media
2. Uploads to NFT mint server
3. server POST IPFS hash
4. Server pins hash and mints nft with ipfs hash
6. Server will return NFT metadata to client
7. Client displays NFT in worldscale XR interface on the web. 

