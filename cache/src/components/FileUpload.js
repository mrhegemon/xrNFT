import React, { Fragment, useEffect, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import { Button } from "@material-ui/core";

function blobToFile(theBlob, fileName){
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  if(!theBlob.lastModifiedDate) theBlob.lastModifiedDate = new Date();
  if(!theBlob.name) theBlob.name = fileName;
  return theBlob;
}

const UploadStates = {
  NotUploaded: 'not',
  Uploading: 'uploading',
  Uploaded: 'uploaded'
}

const FileUpload = ({ upload, latLong, callback }) => {
  // TODO: 
  // 1. Add video preview, re-record and submit buttons
  // 2. On cancel, hide view
  // 3. On submit upload and show progress
  // 4. When file is uploaded, show file uploaded view

  const [uploadState, setUploadState] = useState(UploadStates.NotUploaded);
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if(uploadState !== UploadStates.NotUploaded)
      return;
    setUploadState(UploadStates.Uploading);
      const formData = new FormData();
      const uploadedFile = blobToFile(upload, "video");
      setUploadedFile(uploadedFile);
      formData.append('video', uploadedFile);
      formData.append('location', JSON.stringify(latLong));

        console.log("ATTEMPTING FILE UPLOAD")
        console.log("Uploaded file is")
        console.log(upload)
        console.log(uploadedFile)

        axios.post(`${location.origin}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            console.log(progressEvent);
            const uploadPercentage = parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            setUploadPercentage(
              uploadPercentage
            );

          }
        }).then((res) => {
          setUploadState(UploadStates.Uploaded);

          const { resultCode, thumbnailUrl } = res.data;
          
          console.log("Received response from NFT upload:", resultCode);

        }).catch (err => {
          console.log(err);
      })
  }, [upload]);

  useEffect(() => {
    console.log("Latlong is", latLong);
  }, [latLong])

  return (
    <div className="overlay">
      {message ? <Message msg={message} /> : null}

        <Progress percentage={uploadPercentage} />

      {uploadedFile ? (
        <Button onClick={() => callback('success')}>
                Continue
        </Button>
      ) : null}
    </div>
  );
};

export default FileUpload;