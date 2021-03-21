import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
        <App />

    </div>
  )
}

function App() {
  const [latLong, setLatLong] = useState(null);
  const [caches, setCaches] = useState([]);
  const [ canUseLocation, setCanUseLocation] = useState(true);

  var markerModel = {
        url: './assets/Marker.glb',
        scale: '100 100 100',
        info: ''
    }


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

        const thumbnailUrl = place.thumbnailUrl;

        // TODO: Apply thumbnail as image to marker material

        let model = document.createElement('a-entity');
          model.setAttribute('id', thumbnailUrl);
          model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
          
          model.setAttribute('scale', markerModel.scale);
    
          model.setAttribute('gltf-model', markerModel.url);

          // const distanceMsg = model.getAttribute('gps-entity-place');
  
          // console.log("Distance message is", distanceMsg);

        scene.appendChild(model);
    });
  }

  useEffect(() => {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
      });
    } else {
      console.warn("No geolocation")
    }
  },[])

  const getCaches = (callback) => {
    console.log("Getting caches")
    const max = 50;
    axios.get(`${location.origin}/api/get?lat=${latLong.lat}&lng=${latLong.lng}&max=${max}`)
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

  return latLong !== null ?
  (
      <a-scene
      
      // environment={{ preset: "forest" }}
      vr-mode-ui='enabled: false'
      arjs='sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; debugUIEnabled: true;'>
        <a-camera
          gps-camera
          rotation-reader
        />
        <a-box position='0 0.5 5' material='opacity: 0.5;'></a-box>
        <a-box position='0 0.5 -5' material='opacity: 0.5;'></a-box>
  
      </a-scene>
  ) : (<div></div>)
}
