const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema(
  {
    googlePlaceId: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords) => coords.length === 2,
          message: 'Location must contain [longitude, latitude].'
        }
      }
    },
    rating: { type: Number, default: 0 },
    wifiSpeed: { type: Number, default: 5, min: 0, max: 10 },
    noiseLevel: { type: Number, default: 5, min: 0, max: 10 },
    seatingComfort: { type: Number, default: 5, min: 0, max: 10 },
    powerOutlets: { type: Number, default: 5, min: 0, max: 10 },
    workScore: { type: Number, default: 0, min: 0, max: 10 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

cafeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cafe', cafeSchema);
