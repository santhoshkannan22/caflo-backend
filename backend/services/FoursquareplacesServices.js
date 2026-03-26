const axios = require('axios');

const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v3/places/search';

const fetchNearbyCafes = async ({ latitude, longitude, radius }) => {
  console.log("Search lat:", latitude);
  console.log("Search lng:", longitude);
  try {
    const response = await axios.get(FOURSQUARE_SEARCH_URL, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        Authorization: process.env.FOURSQUARE_API_KEY
      },
      params: {
        ll: `${latitude},${longitude}`,
        radius: 2000,
        categories: "13032",
        limit: 20
      }
    });

    console.log("Foursquare response:", response.data);

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      console.log("No cafes returned from Foursquare");
      return [];
    }

    return response.data.results;
  } catch (error) {
    if (error.response && error.response.status === 410) {
      console.warn("Foursquare V3 Deprecation Detected (410 Gone). Executing silent V2 fallback to populate cafes securely.");
      try {
        const v2Response = await axios.get("https://api.foursquare.com/v2/venues/explore", {
          params: {
            ll: `${latitude},${longitude}`, radius: 2000, categoryId: "4bf58dd8d48988d16d941735",
            limit: 20, client_id: process.env.FOURSQUARE_CLIENT_ID, client_secret: process.env.FOURSQUARE_CLIENT_SECRET, v: "20231010"
          }
        });
        const items = v2Response.data.response?.groups?.[0]?.items || [];
        // Map V2 objects back to V3 format loops
        return items.map(item => ({
          fsq_id: item.venue.id,
          name: item.venue.name,
          location: { address: item.venue.location.address, formatted_address: item.venue.location.address },
          geocodes: { main: { latitude: item.venue.location.lat, longitude: item.venue.location.lng } },
          distance: item.venue.location.distance,
          photos: item.photo ? [item.photo] : [],
          photoUrl: item.photo ? `${item.photo.prefix}original${item.photo.suffix}` : "https://via.placeholder.com/400x300?text=Cafe"
        }));
      } catch (fallbackError) {
        console.error("V2 Fallback failed:", fallbackError.message);
      }
    }
    console.error("Foursquare error:", error.response?.data);
    throw new Error("Foursquare API error: Invalid request token");
  }
};

module.exports = {
  fetchNearbyCafes
};
