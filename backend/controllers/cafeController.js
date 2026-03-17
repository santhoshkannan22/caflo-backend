const Cafe = require('../models/Cafe');
const User = require('../models/User');
const Review = require('../models/Review');
const { fetchNearbyCafes } = require('../services/googlePlacesService');
const { syncNearbyCafes } = require('../services/cafeSyncService');
const calculateWorkScore = require('../utils/calculateWorkScore');

const getNearbyCafes = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.query;

    const places = await fetchNearbyCafes({ latitude, longitude, radius });
    const cafes = await syncNearbyCafes(places);

    return res.status(200).json(
      cafes.map((cafe) => ({
        id: cafe._id,
        name: cafe.name,
        address: cafe.address,
        location: {
          latitude: cafe.location.coordinates[1],
          longitude: cafe.location.coordinates[0]
        },
        rating: cafe.rating,
        workScore: cafe.workScore
      }))
    );
  } catch (error) {
    return next(error);
  }
};

const getCafeById = async (req, res, next) => {
  try {
    const cafe = await Cafe.findById(req.params.id).populate({
      path: 'reviews',
      populate: { path: 'userId', select: 'name' }
    });

    if (!cafe) {
      const error = new Error('Cafe not found.');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      id: cafe._id,
      name: cafe.name,
      address: cafe.address,
      location: {
        latitude: cafe.location.coordinates[1],
        longitude: cafe.location.coordinates[0]
      },
      rating: cafe.rating,
      wifiSpeed: cafe.wifiSpeed,
      noiseLevel: cafe.noiseLevel,
      seatingComfort: cafe.seatingComfort,
      powerOutlets: cafe.powerOutlets,
      workScore: cafe.workScore,
      reviews: cafe.reviews
    });
  } catch (error) {
    return next(error);
  }
};

const saveCafe = async (req, res, next) => {
  try {
    const { cafeId } = req.body;
    const cafe = await Cafe.findById(cafeId);

    if (!cafe) {
      const error = new Error('Cafe not found.');
      error.statusCode = 404;
      throw error;
    }

    const alreadySaved = req.user.savedCafes.some((id) => id.toString() === cafeId);
    if (!alreadySaved) {
      req.user.savedCafes.push(cafeId);
      await req.user.save();
    }

    return res.status(200).json({ message: 'Cafe saved successfully.' });
  } catch (error) {
    return next(error);
  }
};

const getSavedCafes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedCafes');

    return res.status(200).json(
      user.savedCafes.map((cafe) => ({
        id: cafe._id,
        name: cafe.name,
        address: cafe.address,
        rating: cafe.rating,
        workScore: cafe.workScore
      }))
    );
  } catch (error) {
    return next(error);
  }
};

const recalculateCafeMetrics = async (cafeId) => {
  const reviews = await Review.find({ cafeId });
  if (reviews.length === 0) return;

  const aggregate = reviews.reduce(
    (acc, review) => {
      acc.wifiSpeed += review.wifiSpeed;
      acc.noiseLevel += review.noiseLevel;
      acc.seatingComfort += review.seatingComfort;
      return acc;
    },
    { wifiSpeed: 0, noiseLevel: 0, seatingComfort: 0 }
  );

  const wifiSpeed = Number((aggregate.wifiSpeed / reviews.length).toFixed(2));
  const noiseLevel = Number((aggregate.noiseLevel / reviews.length).toFixed(2));
  const seatingComfort = Number((aggregate.seatingComfort / reviews.length).toFixed(2));

  const cafe = await Cafe.findById(cafeId);
  if (!cafe) return;

  cafe.wifiSpeed = wifiSpeed;
  cafe.noiseLevel = noiseLevel;
  cafe.seatingComfort = seatingComfort;
  cafe.workScore = calculateWorkScore({
    wifiSpeed,
    noiseLevel,
    seatingComfort,
    powerOutlets: cafe.powerOutlets
  });

  await cafe.save();
};

module.exports = {
  getNearbyCafes,
  getCafeById,
  saveCafe,
  getSavedCafes,
  recalculateCafeMetrics
};
