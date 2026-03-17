const axios = require('axios');

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

const fetchNearbyCafes = async ({ latitude, longitude, radius }) => {
  const response = await axios.get(GOOGLE_PLACES_URL, {
    timeout: 10000,
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      location: `${Number(latitude)},${Number(longitude)}`,
      radius: Number(radius),
      type: 'cafe'
    }
  });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    const error = new Error(`Google Places API error: ${response.data.status}`);
    error.statusCode = 502;
    throw error;
  }

  return response.data.results || [];
};

module.exports = {
  fetchNearbyCafes
};
