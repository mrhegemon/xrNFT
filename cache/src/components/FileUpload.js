import { Button } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { getThumbnails } from 'video-metadata-thumbnails';

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

const FileUpload = ({ mint, uploadCacheToIPFS, upload, latLong, callback }) => {
  // TODO: 
  // 1. Add video preview, re-record and submit buttons
  // 2. On cancel, hide view
  // 3. On submit upload and show progress
  // 4. When file is uploaded, show file uploaded view

  const [uploadState, setUploadState] = useState(UploadStates.NotUploaded);
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(async () => {
    if(uploadState !== UploadStates.NotUploaded)
      return;
    setUploadState(UploadStates.Uploading);
    (async function(){
      const formData = new FormData();
      const uploadedFile = blobToFile(upload, "video");
      setUploadedFile(uploadedFile);
      formData.append('video', uploadedFile);
      formData.append('location', JSON.stringify(latLong));

        console.log("ATTEMPTING FILE UPLOAD")
        console.log("Uploaded file is")
        console.log(upload)
        console.log(uploadedFile)

        const media = upload;
        const thumbnails = await getThumbnails(upload, {
          quality: 0.6
        });
        const thumbnail = thumbnails[0].blob;
        const metadata = {
          timestamp: Date.now(),
        };
        const CID = await uploadCacheToIPFS({ location: { lat: latLong.lat, lng: latLong.lng }, media, thumbnail, metadata })
        mint(CID);
        setUploadState(UploadStates.Uploaded);
    })();
  }, [upload]);

  useEffect(() => {
    console.log("Latlong is", latLong);
  }, [latLong])

  return (
    <div className="messageoverlay">
    <p>Your cache has been deposited into the world</p>
      {uploadedFile ? (
        <Button variant="contained" color="primary" onClick={() => callback('success')}>
                Continue
        </Button>
      ) : null}
    </div>
  );
};

export default FileUpload;