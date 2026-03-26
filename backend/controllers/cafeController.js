const Cafe = require('../models/Cafe');
const User = require('../models/User');
const Review = require('../models/Review');
const { fetchNearbyCafes } = require('../services/foursquarePlacesService');
const { syncNearbyCafes } = require('../services/cafeSyncService');
const calculateWorkScore = require('../utils/calculateWorkScore');
const { enrichCafeWithSimulatedMetrics } = require('../utils/simulateCafeMetrics');

const getNearbyCafes = async (req, res, next) => {
  try {
    const latitude = req.query.lat || req.query.latitude;
    const longitude = req.query.lng || req.query.longitude;
    const radius = req.query.radius || 2000;

    const places = await fetchNearbyCafes({ latitude, longitude, radius });
    console.log("Places:", places);
    
    // Extract Foursquare distances mapped by their unique fsq_id
    const distanceMap = {};
    places.forEach(item => {
      if (item.id || item.fsq_id) {
        distanceMap[item.id || item.fsq_id] = item.distance || 0;
      }
    });

    let cafes = await syncNearbyCafes(places);

    // Contextual Data Simulation Injection
    const enrichedCafes = cafes.map(cafe => enrichCafeWithSimulatedMetrics(cafe));

    return res.status(200).json(
      enrichedCafes.map((cafe) => ({
        id: cafe._id || cafe.id,
        name: cafe.name,
        photo: cafe.photo,
        address: cafe.address,
        location: {
          lat: cafe.location?.latitude || cafe.location?.coordinates[1] || 0,
          lng: cafe.location?.longitude || cafe.location?.coordinates[0] || 0
        },
        distance: distanceMap[cafe.id] || distanceMap[cafe.fsq_id] || 0,
        wifiSpeed: cafe.metrics?.wifiSpeed || 5,
        rating: cafe.rating,
        metrics: cafe.metrics,
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

    const enrichedCafe = enrichCafeWithSimulatedMetrics(cafe);

    return res.status(200).json({
      id: enrichedCafe._id || enrichedCafe.id,
      name: enrichedCafe.name,
      photo: enrichedCafe.photo,
      address: enrichedCafe.address,
      location: {
        latitude: enrichedCafe.location?.coordinates ? enrichedCafe.location.coordinates[1] : 0,
        longitude: enrichedCafe.location?.coordinates ? enrichedCafe.location.coordinates[0] : 0
      },
      rating: enrichedCafe.rating,
      metrics: enrichedCafe.metrics,
      workScore: enrichedCafe.workScore,
      reviews: enrichedCafe.reviews
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
      console.log("User saved cafes:", req.user.savedCafes);
    }
    
    console.log("Saved cafe:", cafeId);

    return res.status(200).json({ message: 'Cafe saved successfully.' });
  } catch (error) {
    return next(error);
  }
};

const unsaveCafe = async (req, res, next) => {
  try {
    const { cafeId } = req.params;
    
    // Check if it exists in user's saved array
    req.user.savedCafes = req.user.savedCafes.filter(
      (id) => id.toString() !== cafeId
    );
    
    await req.user.save();

    return res.status(200).json({ message: 'Cafe unsaved successfully.' });
  } catch (error) {
    return next(error);
  }
};

const getSavedCafes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedCafes');
    
    // Enrich saved cafes with predictable metrics before throwing to mapper
    const enrichedSaved = user.savedCafes.map(c => enrichCafeWithSimulatedMetrics(c));

    return res.status(200).json(
      enrichedSaved.map((cafe) => ({
        id: cafe._id || cafe.id,
        name: cafe.name,
        photo: cafe.photo,
        address: cafe.address,
        rating: cafe.rating,
        metrics: cafe.metrics,
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
  unsaveCafe,
  getSavedCafes,
  recalculateCafeMetrics
};
