const Cafe = require('../models/Cafe');
const calculateWorkScore = require('../utils/calculateWorkScore');

const DEFAULT_METRICS = {
  wifiSpeed: 5,
  noiseLevel: 5,
  seatingComfort: 5,
  powerOutlets: 5
};

const mapFoursquareToCafePayload = (item) => {
  return {
    fsq_id: item.id || item.fsq_id, // Store Foursquare ID natively
    name: item.name || 'Unknown Cafe',
    photo: item.photoUrl || (item.photos && item.photos.length > 0 ? `${item.photos[0].prefix}original${item.photos[0].suffix}` : null),
    address: item.location?.address || item.location?.formatted_address || '',
    location: {
      type: 'Point',
      coordinates: [item.geocodes?.main?.longitude || 0, item.geocodes?.main?.latitude || 0]
    },
    rating: 8.0 // v3 requires separate fields fetching or parameters
  };
};

const upsertCafeFromFoursquare = async (item) => {
  const payload = mapFoursquareToCafePayload(item);

  const cafe = await Cafe.findOneAndUpdate(
    { fsq_id: payload.fsq_id },
    {
      $set: payload,
      $setOnInsert: {
        ...DEFAULT_METRICS,
        workScore: calculateWorkScore(DEFAULT_METRICS)
      }
    },
    { new: true, upsert: true }
  );

  return cafe;
};

const syncNearbyCafes = async (places) => Promise.all(places.map(upsertCafeFromFoursquare));

module.exports = {
  syncNearbyCafes,
  upsertCafeFromFoursquare
};
