import { Entity, Scene } from 'aframe-react';
import { useState, useCallback, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import axios from 'axios';

import FileUpload from "./FileUpload.js"
import CaptureView from "./CaptureView.js"
import Nav from "./Nav.js"
import Splash from "./Splash.js"

import { ViewModes } from "../constants/ViewModes"

function App() {
  // THREEx.ArToolkitContext.baseURL = 'https://raw.githack.com/jeromeetienne/ar.js/master/three.js/'
  const [viewMode, setViewMode] = useState(ViewModes.ARView);
  const [latLong, setLatLong] = useState(null);
  const [caches, setCaches] = useState([]);
  const [video, setVideo] = useState(null);
  const [signedIn, setSignedIn] = useState(false);

  const [ canUseLocation, setCanUseLocation] = useState(true);

  var markerModel = {
        url: './assets/Marker.glb',
        scale: '0.5 0.5 0.5',
        info: ''
    }
  
  var setModel = function (model, entity) {
    if (model.scale) {
        entity.setAttribute('scale', model.scale);
    }
  
    if (model.rotation) {
        entity.setAttribute('rotation', model.rotation);
    }
  
    if (model.position) {
        entity.setAttribute('position', model.position);
    } else {
      console.log("Model has no position")
    }
  
    entity.setAttribute('gltf-model', model.url);
  };

  useEffect(() => {
    renderPlaces(caches);
  }, [caches])

  function renderPlaces(places) {
    console.log("Rendering places");
    console.log(places);
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        console.log("latitude is", latitude);
        console.log("longitude is", longitude);

        const thumbnailUrl = place.thumbnailUrl;

        console.log("Got thumbnail", thumbnailUrl);

        // TODO: Apply thumbnail as image to marker material

        let model = document.createElement('a-entity');

        if( model.getAttribute('id') == undefined ||
            model.getAttribute('id') == null ||
            model.getAttribute('id') == ""
        ){
          console.log("Model ID isn't set");

          model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
          model.setAttribute("look-at", "[gps-camera]");
          
          setModel(markerModel, model);
              
          const distanceMsg = model.getAttribute('gps-entity-place');
  
          console.log("Distance message is", distanceMsg);
        }

        scene.appendChild(model);
    });
  }
  
  const handleFileUploadCallback = (status) => {
    console.log("File uploaded and returning, status is", status);
    getCaches(() => {
      setViewMode(ViewModes.ARView);
    })
  }

  const getCaches = (callback) => {
    console.log("Getting caches")
    const max = 50;
    axios.get(`${location.origin}/get?lat=${latLong.lat}&lng=${latLong.lng}&max=${max}`)
  .then(function (response) {
    // handle successee
    console.log(response);
    setCaches(response.data.tokens);
    renderPlaces(caches);
    if(callback) callback();
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  }
  
  useEffect(() => {
    if(!latLong){
    if (navigator.geolocation) {
      setCanUseLocation(true);
      navigator.geolocation.getCurrentPosition((position) =>
      setLatLong ({lat: position.coords.latitude, lng: position.coords.longitude}));
    } else {
      setCanUseLocation(false);
    }
  return;
  }

  getCaches();

  }, [latLong])

  const handleVideoCallback = useCallback((success, payload) => {
    if(success){
      setVideo(payload);
      setViewMode(ViewModes.UploadView);
      console.log("Video captured successfully");
    } else {
      setViewMode(ViewModes.ARView);
      console.log("Video capture cancelled");
    }
  }, []);

  const signIn = useCallback(() => {
    axios.get(`${location.origin}/signin`).then((res) => {
      if(res.status === 200) {
        if(res.data.redirect) {
          window.open(res.data.redirect);
        } else if(res.data.user_token) {
          localStorage.setItem('XUMM_USER_TOKEN', res.data.user_token)
        }
      }
    })
  })

  return (
    <div className="App">
      <Nav />
      <Scene
        environment={{ preset: "forest" }}
        vr-mode-ui='enabled: false'
        arjs='sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; debugUIEnabled: true;'>
          <Entity
            primitive="a-camera"
            gps-camera
            rotation-reader
          />
        </Scene>
        { viewMode === ViewModes.ARView && 
        <IconButton onClick={() => { setViewMode(ViewModes.CaptureView)}} style={{position:"absolute", width:"3em", height:"3em", marginLeft: "50%", marginRight: "50%", bottom:"3em"}}>
          <PhotoCamera />
        </IconButton>
        }
        { viewMode === ViewModes.Splash && 
          <Splash />
        }
        { viewMode === ViewModes.CaptureView && 
          <CaptureView callback={handleVideoCallback} />
        }
      { viewMode === ViewModes.UploadView && 
        <FileUpload upload={video} callback={handleFileUploadCallback}/>
      }
      <button onClick={signIn}>Sign In</button>

    </div>
  );
}

export default App;
