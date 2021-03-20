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
    <IconButton size="medium" onClick={() => { console.log("Return callback is", callback); callback(false) }} style={{position:"fixed", zIndex:"10000", width:"3em", height:"3em", right: "3em", top:"3em"}}>
      <CloseIcon fontSize="large"/>
    </IconButton>
    {videoBlob && 
      <Button size="medium" onClick={() => { console.log("Return callback is", callback); callback(true, videoBlob) }} style={{position:"fixed", zIndex:"10000", width:"3em", height:"3em", right: "3em", bottom:"3em"}}>
        Save
      </Button>

    }
    <VideoRecorder
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