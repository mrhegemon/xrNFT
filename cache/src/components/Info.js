import Image from 'next/image';
import React from 'react';
import { Button } from "@material-ui/core";
const Info = ({callback}) => {

  // TODO: 
  // 1. Add fullscreen div and buttons to request location and camera
  // 2. If we have permissions, hide the buttons and show continue
  // 3. Design splash

  return (
      <div className="overlay">
        <img
          src="/assets/InfoLogo.png"
          alt="Logo"
          className="infoLogo"
          style={{
            position: "fixed",
            marginRight: "50%",
            marginLeft: "50%",
            top:"5%",
            transform: "translate(-50%, -0%)"
          }}        />
        <div className="info"
        style={{
          textAlign: "center",
          position: "fixed",
          marginRight: "5%",
          marginLeft: "5%",
          top:"30%",
          height:"60"
                }} 
        >
        <p>
          This demo app is currently connected to a test network.
          To use this, you will need to install Metamask and connect to the Matic Mumbai test network.
        </p>
        <p>Start with <b>https://metamask.io</b></p>
        <p>
          For adding the Mumbai network, you can follow the steps here:
          https://docs.superfluid.finance/superfluid/docs/polygon-network-matic
        </p>
        <Button onClick={() => callback()} variant="contained" color="primary">START</Button>
        </div>
      </div>
  );
};

export default Info;