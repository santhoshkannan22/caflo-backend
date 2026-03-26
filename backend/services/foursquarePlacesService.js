const axios = require('axios');

const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v3/places/search';

const fetchNearbyCafes = async ({ latitude, longitude, radius }) => {
  console.log("Search lat:", latitude);
  console.log("Search lng:", longitude);
  
  if (!process.env.FOURSQUARE_API_KEY) {
    console.warn("Foursquare API key is missing. Skipping external search.");
    return [];
  }

  try {
    const response = await axios.get(FOURSQUARE_SEARCH_URL, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        Authorization: process.env.FOURSQUARE_API_KEY
      },
      params: {
        ll: `${latitude},${longitude}`,
        radius: radius || 2000,
        categories: "13032", // Cafe / Coffee Shop
        limit: 20,
        // MUST request photos explicitly in V3, otherwise it returns none
        fields: "fsq_id,name,location,distance,photos,rating,geocodes"
      }
    });

    console.log(`Foursquare returned ${response.data.results?.length || 0} results.`);

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return [];
    }

    // Map V3 results into a consistent object format for the sync service
    return response.data.results.map(item => {
      // Build the photo URL from Foursquare's prefix and suffix
      let photoUrl = "https://via.placeholder.com/400x300?text=Cafe";
      
      if (item.photos && item.photos.length > 0) {
        // 'original' size parameter dynamically pulls the best resolution photo
        photoUrl = `${item.photos[0].prefix}original${item.photos[0].suffix}`;
      }

      return {
        fsq_id: item.fsq_id,
        name: item.name,
        location: {
          address: item.location?.address || item.location?.formatted_address,
          formatted_address: item.location?.formatted_address
        },
        geocodes: item.geocodes,
        distance: item.distance,
        photos: item.photos ? [ photoUrl ] : [],
        photoUrl: photoUrl,
        rating: item.rating || 0
      };
    });

  } catch (error) {
    console.error("Foursquare API V3 error:", error.response?.data || error.message);
    throw new Error("Failed to fetch cafes from Foursquare.");
  }
};

module.exports = {
  fetchNearbyCafes
};
