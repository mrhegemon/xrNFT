import 'aframe-look-at-component';
import { useState, useCallback, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import axios from 'axios';
import Image from 'next/image';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FileUpload from "./FileUpload.js"
import CaptureView from "./CaptureView.js"
import Nav from "./Nav.js"
import Splash from "./Splash.js"
import Info from "./Info.js"

import Web3 from 'web3'
import Cache from '../abis/Cache.json'

import { ViewModes } from "../constants/ViewModes"

import { create, globSource } from 'ipfs-core';

let IPFS

function App() {
  // THREEx.ArToolkitContext.baseURL = 'https://raw.githack.com/jeromeetienne/ar.js/master/three.js/'
  const [viewMode, setViewMode] = useState(ViewModes.Splash);
  const [latLong, setLatLong] = useState(null);
  const [video, setVideo] = useState(null);

  const [canUseLocation, setCanUseLocation] = useState(true);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [caches, setCaches] = useState([]);

  const uploadCacheToIPFS = async ({ location, thumbnail, media, metadata }) => {

    const [thumbnailCID, mediaCID] = await Promise.all([addToIPFS(thumbnail), addToIPFS(media)]);
    const CID = await addToIPFS(JSON.stringify({ location, metadata, thumbnailUrl: thumbnailCID, dataUrl: mediaCID }));
    await loadBlockchainData();
    return CID;
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


  useEffect(() => {
    (async function () {
      if (!IPFS) {
        IPFS = await create()
      }
      await loadWeb3();
      console.log("Attempting to load chain data");
      await loadBlockchainData();
      // const nearItems = await getNFTs({ lat, lng }, max, state.caches);
      setViewMode(ViewModes.Info);
      let scene = document.querySelector('a-scene');
      scene.renderer.setPixelRatio(window.devicePixelRatio);
      let camera = document.createElement('a-camera');
      camera.setAttribute('gps-camera', "minDistance: 0; maxDistance: 10000000000000000");
      camera.setAttribute('rotation-reader', true);
      scene.appendChild(camera)
    })();

  }, []);

  const getNFTs = ({ lat, lng }, maxCount) => {
    const closest = [];
    Object.entries(data).forEach(([nftLocation, nft]) => {
      const [nftLat, nftLong] = nftLocation.split(':');

      // todo: make this better
      if (Math.abs(nftLat - lat) < 1 && Math.abs(nftLong - lng) < 1 && closest.length < maxCount - 1) {
        closest.push(nft);
      }
    })
    return closest;
  }

  const loadWeb3 = async () => {
    if (window.ethereum) {
      console.log("ethereum located")
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      console.log("Eth enabled");
    }
    else if (window.web3) {
      console.log("Web3 located")

      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async () => {
    console.log("loadBlockchainData")

    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()

    setAccount(accounts[0])

    console.log("Accounts are", account)

    const networkId = await web3.eth.net.getId()
    const networkData = Cache.networks[networkId]
    console.log("networkData is", networkData)


    if (networkData) {
      const abi = Cache.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      const totalSupply = await contract.methods.totalSupply().call()
      let caches = [];
      // Load Caches
      for (var i = 1; i <= totalSupply; i++) {
        const cache = await contract.methods.caches(i - 1).call()
        caches.push(cache);
      }
      setTotalSupply(totalSupply);
      setContract(contract);
      setCaches(caches);
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  // const loadDataFromEtherscan = async () => {
  //   abiDecoder.addABI(Cache.abi);
  //   const txlist = await(await fetch((location.href.includes('localhost') ? 'https://cors-anywhere.herokuapp.com/' : '') + 'https://api.etherscan.io/api?module=account&action=txlist&address=0x01871cDa2a2061dbF84529537B72cD57D01DDEA2&startblock=0&endblock=latest&page=1&sort=desc&offset=100')).json();

  //   for(const txn of txlist.result || []) {
  //     console.log(txn)
  //     const input = abiDecoder.decodeMethod(txn.input)
  //     console.log(input)
  //     // TODO: 
  //     // const cache = input.something
  //     // setState({
  //     //   ...state,
  //     //     caches: [...state.caches, cache]
  //     //   })
  //   }
  // }

  const mint = (cache) => {
    contract.methods.mint(cache).send({ from: account })
      .once('receipt', (receipt) => {
        const newCaches = caches;
        newCaches.push(cache);
        setCaches(newCaches);
      })
  }
  var markerModel = {
    url: './assets/Marker.glb',
    scale: '0.1 0.1 0.1',
    info: ''
  }

  useEffect(() => {
    renderPlaces(caches);
  }, [caches])

  function renderPlaces(places) {
    console.log("Rendering places");
    console.log(places);
    let scene = document.querySelector('a-scene');

    places?.forEach(async (place) => {

      let metadata = await (await fetch('https://ipfs.io/ipfs/' + place)).json()
      console.log(metadata)

      let latitude = metadata.location.lat;
      let longitude = metadata.location.lng;
      // console.log("latitude is", latitude);
      // console.log("longitude is", longitude);

      const thumbnailUrl = metadata.thumbnailUrl;
      const mediaUrl = metadata.dataUrl;

      // console.log("Got thumbnail", thumbnailUrl);

      // TODO: Apply thumbnail as image to marker material

      let marker = document.createElement('a-entity');

      console.log("Model ID isn't set");
      marker.setAttribute('id', thumbnailUrl);
      marker.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
      marker.setAttribute("look-at", "[camera]");
      marker.setAttribute('rotation', '0 0 0');
      // model.setAttribute('animation-mixer', '');

      marker.setAttribute('class', 'collidable')
      marker.setAttribute('raycaster', "objects: [data-raycastable]")


      let markerImage = document.createElement('a-circle')
      markerImage.setAttribute('src', '/assets/markerImage.png');
      markerImage.setAttribute('position', '0 -1 -0.1')
      markerImage.setAttribute('scale', '8 8 8')
      markerImage.setAttribute('radius', '0.5');

      marker.appendChild(markerImage)

      marker.addEventListener('loaded', () => {
        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
      });

      marker.setAttribute('scale', markerModel.scale);
      // model.setAttribute('gltf-model', markerModel.url);

      scene.appendChild(marker);

      let thumbnail = document.createElement('a-circle')
      thumbnail.setAttribute('src', 'https://ipfs.io/ipfs/' + thumbnailUrl);
      thumbnail.setAttribute('scale', '3 3 3')
      thumbnail.object3D.visible = true;

      let videoOutline = document.createElement('a-plane')
      videoOutline.setAttribute('color', '#FFA600')
      videoOutline.setAttribute('scale', '1.1 1.1 1.1')
      videoOutline.setAttribute('position', '0 0 -0.1')

      let video = document.createElement('a-plane')
      video.setAttribute('src', 'https://ipfs.io/ipfs/' + mediaUrl);
      video.setAttribute('position', '0 -0.5 0.1')
      video.setAttribute('scale', '9 9 9')
      video.object3D.visible = false;

      video.appendChild(videoOutline)

      let videoIsPlaying = false;

      marker.addEventListener('click', () => {
        videoIsPlaying = !videoIsPlaying;
        if (videoIsPlaying) {
          thumbnail.object3D.visible = false;
          video.object3D.visible = true;
        } else {
          thumbnail.object3D.visible = true;
          video.object3D.visible = false;
        }
      })

      marker.appendChild(thumbnail)
      marker.appendChild(video)

    });
  }

  const handleFileUploadCallback = (status) => {
    console.log("File uploaded and returning, status is", status);
    // getCaches(() => {
    setViewMode(ViewModes.ARView);
    // })
  }

  // const getCaches = (callback) => {
  //   console.log("Getting caches")
  //   const max = 50;
  //   axios.get(`${location.origin}/api/get?lat=${latLong.lat}&lng=${latLong.lng}&max=${max}`)
  // .then(function (response) {
  //   // handle successee
  //   console.log(response);
  //   setCaches(response.data);
  //   renderPlaces(caches);
  //   if(callback) callback();
  // })
  // .catch(function (error) {
  //   // handle error
  //   console.log(error);
  // })
  // }

  useEffect(() => {
    if (!latLong) {
      if (navigator.geolocation) {
        setCanUseLocation(true);
        navigator.geolocation.getCurrentPosition((position) => {
          console.log(position)
          setLatLong({ lat: position.coords.latitude, lng: position.coords.longitude });
        }, error => {
          console.log("Error setting gps location")
          axios.get("https://ipapi.co/json/?key=MRx6asqCN2leEg6PDBBWYCQtI0Fxdtg7JcZ5FBAwl7swsSYG8Z")
            .then(function (response) {
              // handle successee
              console.log(response);
              const { latitude, longitude } = response.data;
              setLatLong({ lat: latitude, lng: longitude });
              console.log("Latlong set to", latitude, longitude);

              setCanUseLocation(false);
            })
        })
      } else {
        axios.get("https://ipapi.co/json/?key=MRx6asqCN2leEg6PDBBWYCQtI0Fxdtg7JcZ5FBAwl7swsSYG8Z")
          .then(function (response) {
            // handle successee
            console.log(response);
            const { latitude, longitude } = response.data;
            console.log("Latlong set to", latitude, longitude);
            setLatLong({ lat: latitude, lng: longitude });
            setCanUseLocation(false);

          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
      }

    }

  }, [latLong])

  const handleVideoCallback = useCallback((success, payload) => {
    if (success) {
      setVideo(payload);
      setViewMode(ViewModes.UploadView);
      console.log("Video captured successfully");
    } else {
      setViewMode(ViewModes.ARView);
      console.log("Video capture cancelled");
    }
  }, []);

  return (
    <div className="App">
      <Nav />
      <a-scene
        cursor="rayOrigin: mouse"
        vr-mode-ui='enabled: false'
        arjs='sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; debugUIEnabled: false;'>
      </a-scene>
      { viewMode === ViewModes.Splash &&
        <Splash />
      }
      { viewMode === ViewModes.Info &&
        <Info callback={() => { setViewMode(ViewModes.ARView) }} />
      }
      { viewMode === ViewModes.ARView &&
        <IconButton onClick={() => { setViewMode(ViewModes.CaptureView) }} style={{ color: "#FFFFFFFF", position: "absolute", marginLeft: "50%", marginRight: "50%", bottom: "2em" }}
        iconStyle={{width:60, height:60 }}
        >
          <AddBoxIcon/>
        </IconButton>
      }
      { viewMode === ViewModes.CaptureView &&
        <CaptureView callback={handleVideoCallback} />
      }
      { viewMode === ViewModes.UploadView &&
        <FileUpload mint={mint} uploadCacheToIPFS={uploadCacheToIPFS} upload={video} latLong={latLong} callback={handleFileUploadCallback} />
      }

      { caches.map((cache, key) => {
        return (
          <div key={key} className="col-md-3 mb-3">
            <div>{cache}</div>
          </div>
        )
      })}
    </div>
  );
}

export default App;
