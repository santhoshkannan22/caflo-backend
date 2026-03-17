const Review = require('../models/Review');
const Cafe = require('../models/Cafe');
const { recalculateCafeMetrics } = require('./cafeController');

const createReview = async (req, res, next) => {
  try {
    const { cafeId, wifiSpeed, noiseLevel, seatingComfort, comment } = req.body;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      const error = new Error('Cafe not found.');
      error.statusCode = 404;
      throw error;
    }

    const review = await Review.create({
      userId: req.user._id,
      cafeId,
      wifiSpeed,
      noiseLevel,
      seatingComfort,
      comment
    });

    cafe.reviews.push(review._id);
    await cafe.save();

    await recalculateCafeMetrics(cafeId);

    return res.status(201).json({
      id: review._id,
      userId: review.userId,
      cafeId: review.cafeId,
      wifiSpeed: review.wifiSpeed,
      noiseLevel: review.noiseLevel,
      seatingComfort: review.seatingComfort,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview
};
