import React, { useState, useEffect } from 'react';
import VideoRecorder from 'react-video-recorder'
import CloseIcon from '@material-ui/icons/Close';
import { Button, IconButton } from '@material-ui/core';

const CaptureView = (props) => {
  const { callback } = props;
  const [videoBlob, setVideoBlob] = useState(null);

  // TODO: 
  // 3. On finished recording, go to preview/upload
  // 4. Flip camera!

  return (
    <div className="overlay">
    <IconButton size="medium" onClick={() => { console.log("Return callback is", callback); callback(false) }} style={{position:"fixed", zIndex:"10000", width:"3em", height:"3em", right: "1em", top:"1em"}}>
      <CloseIcon fontSize="large"/>
    </IconButton>
    {videoBlob && 
      <Button size="medium" onClick={() => { console.log("Return callback is", callback); callback(true, videoBlob) }}
      variant="contained" color="primary"
      style={{position:"fixed", zIndex:"10000", width:"4em", height:"2em", marginRight: "50%", marginLeft: "50%", bottom:"1.5em", transform: "translate(-50%, 0%)"
    }}>
        Save
      </Button>

    }
    <VideoRecorder
      useVideoInput={true}
      onRecordingComplete={video => {
        setVideoBlob(video);
        // callback(true, videoBlob);
        console.log('Video recording complete', video);
      }}
    />
    </div>
  );
};

export default CaptureView;