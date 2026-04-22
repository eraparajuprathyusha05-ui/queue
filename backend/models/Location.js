const mongoose = require("mongoose");

const historyPointSchema = new mongoose.Schema(
  {
    estimatedPeople: {
      type: Number,
      default: 0,
    },
    waitingTime: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const coordinatesSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ["Hospital", "Bank", "Canteen", "Other"],
    default: "Other",
  },
  manualEntries: {
    type: [Number],
    default: [],
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  gpsCrowdCount: {
    type: Number,
    default: 0,
  },
  geoFenceRadiusMeters: {
    type: Number,
    default: 250,
  },
  coordinates: {
    type: coordinatesSchema,
    default: () => ({
      lat: 0,
      lng: 0,
    }),
  },
  averageManual: {
    type: Number,
    default: 0,
  },
  estimatedPeople: {
    type: Number,
    default: 0,
  },
  waitingTime: {
    type: Number,
    default: 0,
  },
  crowdLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  history: {
    type: [historyPointSchema],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Location", locationSchema);
