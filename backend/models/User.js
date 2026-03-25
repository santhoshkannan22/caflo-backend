const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema(
  {
    quietCafe: { type: Boolean, default: false },
    fastWifi: { type: Boolean, default: false },
    comfortableSeating: { type: Boolean, default: false },
    powerOutlets: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    profileImage: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    preferences: { type: preferencesSchema, default: () => ({}) },
    savedCafes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cafe' }]
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('User', userSchema);
