const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cafeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafe', required: true },
    wifiSpeed: { type: Number, required: true, min: 0, max: 10 },
    noiseLevel: { type: Number, required: true, min: 0, max: 10 },
    seatingComfort: { type: Number, required: true, min: 0, max: 10 },
    comment: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Review', reviewSchema);
