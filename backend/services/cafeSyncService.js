const Cafe = require('../models/Cafe');
const calculateWorkScore = require('../utils/calculateWorkScore');

const DEFAULT_METRICS = {
  wifiSpeed: 5,
  noiseLevel: 5,
  seatingComfort: 5,
  powerOutlets: 5
};

const mapGooglePlaceToCafePayload = (place) => ({
  googlePlaceId: place.place_id,
  name: place.name,
  address: place.vicinity,
  location: {
    type: 'Point',
    coordinates: [place.geometry.location.lng, place.geometry.location.lat]
  },
  rating: place.rating || 0
});

const upsertCafeFromGoogle = async (place) => {
  const payload = mapGooglePlaceToCafePayload(place);

  const cafe = await Cafe.findOneAndUpdate(
    { googlePlaceId: place.place_id },
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

const syncNearbyCafes = async (places) => Promise.all(places.map(upsertCafeFromGoogle));

module.exports = {
  syncNearbyCafes,
  upsertCafeFromGoogle
};
