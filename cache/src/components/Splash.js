import React from 'react';
import Image from 'next/image'

const Splash = () => {

  // TODO: 
  // 1. Add fullscreen div and buttons to request location and camera
  // 2. If we have permissions, hide the buttons and show continue
  // 3. Design splash

  return (
    <div className="overlay">
      <img
        style={{
          position: "fixed",
          marginRight: "50%",
          marginLeft: "50%",
          top:"40%",
          transform: "translate(-50%, -50%)"
        }}
        src="/assets/SplashLogo.png"
        alt="Logo"
        className="splashLogo"
      />
    </div>
  );
};

export default Splash;