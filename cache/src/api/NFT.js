const { create, globSource } = require('ipfs-core');
const { RippleAPI } = require('ripple-lib');
const xAddr = require('xrpl-tagged-address-codec');
const { XummSdk } = require('xumm-sdk')
var uuidv4 = require('uuid/v4');

const tempXummAcc = 'rLv5Hjg6rpN9TLfPrQ7u3Sr4UagX4co7FW'

const { getNFTs, saveNFT } = require('./storage')

const rippleTestNet = 'wss://s.altnet.rippletest.net';
const Ripple = new RippleAPI({ server: rippleTestNet });
let IPFS;

const XUMM = new XummSdk(process.env.XUMMKEY, process.env.XUMMSECRET);

const treasuryWallet = {}

const initMinter = async (secret) => {
  return Promise.all([
    startIPFS(),
    startRipple(secret),
    startXumm(),
  ]);
}

const stopMinter = async () => {
  return Promise.all([
    Ripple.disconnect(),
    IPFS.stop()
  ]);
}

const startXumm = () => {
  return new Promise((resolve) => {
    let walletFundedChecking = setInterval(async () => {
      try {
        if(await XUMM.ping()) {
          clearInterval(walletFundedChecking);
          resolve()
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000); //Will check every 10 seconds
  })
}

const createSignInRequest = async (callback) => {
  const signInRequest = await XUMM.payload.create({ 
    options: {
      submit: false,
      expire: 240,
      return_url: {
        app: `${location.origin}/api/signin?payload={id}`,
        web: `${location.origin}/api/signin?payload={id}`
      }
    },
    txjson: {
      TransactionType : "SignIn"
    }
  })
  awaitSignInConfirmation(signInRequest, callback);
  return signInRequest;
}

const awaitSignInConfirmation = async (signInRequest, callback) => {
  const { created } = await XUMM.payload.createAndSubscribe(signInRequest)
  callback(created)
}

const mintNFT = async ({ location, thumbnail, media, metadata }, user_token) => {

  if(!user_token) user_token = await new Promise((resolve, reject) => {
    createSignInRequest((payload) => {
      if(payload) resolve(payload);
      reject();
    })
  })

  const locationString = location.lat + ':' + location.long

  // upload thumbnail and media in parallel
  const [thumbnailCID, mediaCID] = await Promise.all([ addToIPFS(thumbnail), addToIPFS(media)]);

  const CID = await addToIPFS(JSON.stringify({ location: locationString, metadata, thumbnailUrl: thumbnailCID, dataUrl: mediaCID }));
  const CID_URI = `ipfs://${CID}/`;
  
  const transactionRequest = await XUMM.payload.create({ 
    txjson: {
      TransactionType: 'Payment',
      Destination: process.env.ADDRESS,
      Amount: '10',
      Fee: '12',
      Memos:[
        {
          Memo:{
            MemoData: Buffer.from(CID, 'utf-8').toString('hex').toUpperCase(),
          }
        }
      ]
    },
    user_token
  })
  console.log(transactionRequest)
  const success = await new Promise((resolve, reject) => {
    XUMM.payload.createAndSubscribe(transactionRequest, (progress) => {
      console.log(progress)
    })
  })
  // todo: handle this better
  if(!success) return;
  
  const payload = await XUMM.payload.get(transactionRequest)
  console.log(payload)

  // todo
  saveNFT(location, { memo: payload.payload.request_json.Memos[0].Memo.MemoData, CID })
  
  return { 
    ipfsCID: CID,
  }
}

const getNFT = async (location, maxCount) => {
  return getNFTs(location, maxCount);
}

const startIPFS = async () => {
  IPFS = await create();
}

const addToIPFS = async (dataToUpload, metadata) => {
  console.log(typeof dataToUpload)
  const file = {
    content: dataToUpload,
    path: metadata ? 'metadata.json' : undefined
  }
  const addOptions = {
    pin: true,
    timeout: 300000
  };

  const result = await IPFS.add(file, addOptions);
  return result.cid.toString();
}

const startRipple = async (secret) => {
  await Ripple.connect();
  if (await Ripple.isValidSecret(secret)) {

    // get treasury details
    const { publicKey } = await Ripple.deriveKeypair(secret);
    treasuryWallet.address = await Ripple.deriveAddress(publicKey)
    treasuryWallet.xAddress = await xAddr.Encode({ account: treasuryWallet.address})
    treasuryWallet.secret = secret
    
    // check treasury is activated has enough to make transaction
    await new Promise((resolve, reject) => {
      const walletFundedChecking = setInterval(async () => {
        try {
          console.log(treasuryWallet)
          await Ripple.getSettings(treasuryWallet.address);
          clearInterval(walletFundedChecking);
          resolve()
        } catch (e) {console.log(e)}
      }, 1000); //Will check every 10 seconds
    })
    console.log('Connected to the XRPL')
  } else {
    throw new Error('Supplied treasury wallet not valid! Try again...')
  }
}

// const updateXRPWalletData = async (xrpDomainField, wallet) => {
//   try {
//     const baseFee = await Ripple.getFee();
//     const fee = (parseFloat(baseFee) * 1000000).toFixed(0) + "";
    
//     const accInfo = await Ripple.getAccountInfo(wallet.address);
//     const seqNum = accInfo.sequence;

//     const walletData = JSON.stringify({
//         "TransactionType": "AccountSet",
//         "Account" : wallet.address,
//         "Fee": fee,
//         "Sequence": seqNum,
//         "SetFlag": 5,
//         "Domain": xrpDomainField
//     })

//     const signedTX = Ripple.sign(walletData, wallet.secret);

//     const tx = await Ripple.submit(signedTX.signedTransaction)
//     return tx;
  
//   } catch (e) {
//     console.log(`Failed to mint token: ${e}`);
//   }
// }

module.exports = {
  initMinter,
  stopMinter,
  mintNFT,
  getNFT,
  createSignInRequest
}


  // we arent doing transactions for now, just wallet domain
// const getNFTsFromWallet = async () => {
  // const details = await getWalletDetails(wallet.address);
  // if(!details) return false;
  
  // const options = {
  //   limit: 5,
  //   earliestFirst: true,
  //   minLedgerVersion: 33928173
  // };
  
  // try {
  //   const txns = await Ripple.getTransactions(wallet.address, options);
  //   console.log(txns)
  // } catch (e) {
  //   console.log(e)
  // }
// }


// make sure our wallet has enough drops to complete the mint
const getWalletDetails = async (walletAddress) => {
  try {
    return new Promise(async (resolve, reject) => {
        try {
          const details = await Ripple.getSettings(walletAddress);
          resolve(details)
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
