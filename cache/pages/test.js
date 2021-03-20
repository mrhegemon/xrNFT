import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Scene, Entity, Box } from 'aframe-react';
import App from '../src/components/App'
import NoSSR from 'react-no-ssr';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
        <script src="https://unpkg.com/aframe-environment-component@1.2.0/dist/aframe-environment-component.min.js"></script>
        <script src="https://unpkg.com/aframe-look-at-component@0.8.0/dist/aframe-look-at-component.min.js"></script>
        <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js"></script>

      </Head>
      <Scene
        vr-mode-ui="enabled: false"
        embedded
        arjs='sourceType: webcam; debugUIEnabled: false;'>

        <Box scale="15 15 15" position="0 200 0" gps-entity-place="latitude: your-latitude>; longitude: your-longitude;"></Box>
        <Entity
          primitive="a-camera"
          gps-camera
          rotation-reader
        />
      </Scene>
    </div>
  )
}
