const { create, globSource } = require('ipfs-core');
const { RippleAPI } = require('ripple-lib');
const xAddr = require('xrpl-tagged-address-codec');
// const ipfsHash = require('ipfs-only-hash')
// const fileSys = require('fs');
// const crypto = require('crypto');

const rippleTestNet = 'wss://s.altnet.rippletest.net';
const Ripple = new RippleAPI({ server: rippleTestNet });
let IPFS;
const treasuryWallet = {};
const NFTs = new Map();

const initMinter = async (secret) => {
  return Promise.all([
    startIPFS(),
    connectToXRPL(secret),
    verifyWallet(treasuryWallet.address)
  ]);
}

const stopMinter = async () => {
  return Promise.all([
    Ripple.disconnect(),
    IPFS.stop()
  ]);
}

const mintNFT = async (filePathToUpload) => {
  if(!await verifyWallet(treasuryWallet.address)) return;
  const rootCID = await addToIPFS(filePathToUpload);
  const rootString = rootCID.cid.toString();
  const rootStringURL = `ipfs://${rootString}/`;
  const xrpDomainField = new Buffer.from(rootStringURL).toString('hex').toUpperCase();
  const tx = await updateXRPWalletData(xrpDomainField, treasuryWallet);
  return { 
    timestamp: Date.now(),
    ipfs: rootString,
  }
}

const getNFT = async (tx) => {
  // todo
}

const getNFTsFromWallet = async () => {
  if(!await verifyWallet(treasuryWallet.address)) return;
  const options = {

    limit: 5,
    earliestFirst: true,
    minLedgerVersion: 33928173
  };
  try {

    const txns = await Ripple.getTransactions(treasuryWallet.address, options);
    console.log(txns)
  } catch (e) {
    console.log(e)
  }
}


const connectToXRPL = async (secret) => {
  await Ripple.connect();

  if (await Ripple.isValidSecret(secret)) {

    const { publicKey } = await Ripple.deriveKeypair(secret);
    treasuryWallet.address = await Ripple.deriveAddress(publicKey)
    treasuryWallet.axAddress = await xAddr.Encode({ account: treasuryWallet.address })
    treasuryWallet.secret = secret;

    console.log('Connected to the XRPL')

  } else {
    console.log('Failed to derive secret')
  }
  getNFTsFromWallet();
}

const startIPFS = async () => {
  IPFS = await create();
}

const addToIPFS = async (filePathToUpload) => {

  const path = 'public/uploads/' + filePathToUpload;
  const addOptions = {
      pin: true,
      cidVersion: 1,
      timeout: 300000
  };

  let rootCID = "";
  for await (const file of IPFS.addAll(globSource(path), addOptions)) {
    if (file.path == filePathToUpload){
      rootCID = file;
    }
  }
  return rootCID
}

// make sure our wallet has enough drops to complete the mint
const verifyWallet = async (walletAddress) => {
  try {
    return new Promise(async (resolve, reject) => {
        try {
          console.log(await Ripple.getSettings(walletAddress));
          resolve(true)
        } catch (error) {
          if(error.data) {
            switch (error.data.error) {
              case "NotConnectedError":
                console.warn(`reconnecting to XRP Ledger...`);
                Ripple.connect();
                break;

              case "actNotFound":
                console.log(`account validation waiting, last check results: ${error.data.error}`);
                break;

              default:
                console.error(`encountered error during validation of wallet funding: ${JSON.stringify(error, null, 2)}`);
                reject()
                break;
            }
          }
        }
    });
  } catch (error) {
    console.log(error)
  }
}

const updateXRPWalletData = async (xrpDomainField, walletAddress) => {
  try {
    const baseFee = await Ripple.getFee();
    fee = (parseFloat(baseFee) * 1000000).toFixed(0) + "";
    
    const accInfo = await Ripple.getAccountInfo(walletAddress.address);
    const seqNum = accInfo.sequence;

    const walletData = JSON.stringify({
        "TransactionType": "AccountSet",
        "Account" : walletAddress.address,
        "Fee": fee,
        "Sequence": seqNum,
        "SetFlag": 5,
        "Domain": xrpDomainField
    })

    const signedTX = Ripple.sign(walletData, walletAddress.secret);

    const tx = await Ripple.submit(signedTX.signedTransaction)
    return tx;
  
  } catch (e) {
    console.log(`Failed to mint token: ${e}`);
  }
}

module.exports = {
  initMinter,
  stopMinter,
  mintNFT,
  getNFT
}