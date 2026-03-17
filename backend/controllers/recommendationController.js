const Cafe = require('../models/Cafe');
const { fetchNearbyCafes } = require('../services/googlePlacesService');
const { syncNearbyCafes } = require('../services/cafeSyncService');
const { sortRecommendations } = require('../services/recommendationService');

const getRecommendations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 3000, preference } = req.query;

    // Refresh nearby cafes from Google first so recommendations are current.
    const places = await fetchNearbyCafes({ latitude, longitude, radius });
    await syncNearbyCafes(places);

    const cafes = await Cafe.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          distanceField: 'distanceMeters',
          maxDistance: Number(radius),
          spherical: true
        }
      }
    ]);

    const ranked = sortRecommendations({ cafes, preference }).slice(0, 5);

    return res.status(200).json(
      ranked.map((cafe) => ({
        id: cafe._id,
        name: cafe.name,
        address: cafe.address,
        workScore: cafe.workScore,
        distanceMeters: Math.round(cafe.distanceMeters),
        wifiSpeed: cafe.wifiSpeed,
        noiseLevel: cafe.noiseLevel,
        seatingComfort: cafe.seatingComfort
      }))
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecommendations
};
