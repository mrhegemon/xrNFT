const querystring = require('querystring');
const url = require('url');

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const mockNFTS = {
  tokens: [
    {
      name: "LAGUNA_1", // Marker is irrelevant
      location: {
        lat: 33.5146934,
        lng: -117.7238909
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    },
    {
      name: "LAGUNA_2", // Marker is irrelevant
      location: {
        lat: 33.5046934,
        lng: -117.7138909
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    },
    {
      name: "LAGUNA_3", // Marker is irrelevant
      location: {
        lat: 33.5046934,
        lng: -117.7238909
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    },
    {
      name: "DTLA_1", // Marker is irrelevant
      location: {
        lat: 34.045022401439084,
        lng: -118.251713100914
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    },
    {
      name: "DTLA_2", // Marker is irrelevant
      location: {
        lat: 34.0444,
        lng: -118.251630
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    },
    {
      name: "DTLA_3", // Marker is irrelevant
      location: {
        lat: 34.039,
        lng: -118.251630
      },
      thumbnailUrl: "/uploads/0fdc8067-7609-47d8-8401-4d5ba05c90b9.png"
    }
  ]
}

export default (req, res) => {
  let parsedUrl = url.parse(req.url);
  let { lat, lng, max } = querystring.parse(parsedUrl.query);
  console.log("Received get request with lat long max", lat, lng, max);
  return res.status(200).send(JSON.stringify(mockNFTS));
}
