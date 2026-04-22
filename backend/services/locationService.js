const mongoose = require("mongoose");

const Location = require("../models/Location");
const { calculateQueueStats } = require("../utils/queueMath");

const MAX_MANUAL_ENTRIES = 10;
const MAX_HISTORY_POINTS = 20;
const GPS_TTL_MS = 60 * 1000;

let useMemoryStore = false;
let memoryLocations = [];
const gpsPresenceStore = new Map();

const sampleLocations = [
  {
    name: "CityCare Hospital",
    category: "Hospital",
    manualEntries: [9, 11, 8],
    activeUsers: 6,
    coordinates: { lat: 28.6139, lng: 77.209 },
    geoFenceRadiusMeters: 250,
  },
  {
    name: "Downtown Bank",
    category: "Bank",
    manualEntries: [4, 6, 5],
    activeUsers: 3,
    coordinates: { lat: 28.6304, lng: 77.2177 },
    geoFenceRadiusMeters: 220,
  },
  {
    name: "Campus Canteen",
    category: "Canteen",
    manualEntries: [7, 10, 8],
    activeUsers: 5,
    coordinates: { lat: 28.6219, lng: 77.2081 },
    geoFenceRadiusMeters: 180,
  },
];

function addHistoryPoint(location) {
  const nextPoint = {
    estimatedPeople: location.estimatedPeople,
    waitingTime: location.waitingTime,
    timestamp: new Date(),
  };

  const currentHistory = location.history || [];
  return [...currentHistory, nextPoint].slice(-MAX_HISTORY_POINTS);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(pointA, pointB) {
  const earthRadius = 6371000;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function pruneExpiredGpsSignals() {
  const cutoff = Date.now() - GPS_TTL_MS;

  for (const [userId, signal] of gpsPresenceStore.entries()) {
    if (signal.timestamp < cutoff) {
      gpsPresenceStore.delete(userId);
    }
  }
}

function getGpsCrowdCount(location) {
  pruneExpiredGpsSignals();

  const coordinates = location.coordinates || {};
  if (!coordinates.lat || !coordinates.lng) {
    return 0;
  }

  let count = 0;

  for (const signal of gpsPresenceStore.values()) {
    const distance = calculateDistanceMeters(
      { lat: coordinates.lat, lng: coordinates.lng },
      { lat: signal.lat, lng: signal.lng }
    );

    if (distance <= (location.geoFenceRadiusMeters || 250)) {
      count += 1;
    }
  }

  return count;
}

function toClientLocation(location) {
  return {
    id: String(location._id || location.id),
    name: location.name,
    category: location.category,
    manualEntries: location.manualEntries,
    activeUsers: location.activeUsers,
    gpsCrowdCount: location.gpsCrowdCount || 0,
    blendedActiveUsers: (location.activeUsers || 0) + (location.gpsCrowdCount || 0),
    geoFenceRadiusMeters: location.geoFenceRadiusMeters || 250,
    coordinates: location.coordinates || { lat: 0, lng: 0 },
    averageManual: location.averageManual,
    estimatedPeople: location.estimatedPeople,
    waitingTime: location.waitingTime,
    crowdLevel: location.crowdLevel,
    history: location.history,
    lastUpdated: location.lastUpdated,
  };
}

function buildQueueLocation(data) {
  const manualEntries = (data.manualEntries || []).slice(-MAX_MANUAL_ENTRIES);
  const gpsCrowdCount =
    typeof data.gpsCrowdCount === "number" ? data.gpsCrowdCount : getGpsCrowdCount(data);
  const stats = calculateQueueStats(manualEntries, data.activeUsers || 0, gpsCrowdCount);

  const location = {
    ...data,
    manualEntries,
    gpsCrowdCount,
    ...stats,
    lastUpdated: new Date(),
  };

  location.history = addHistoryPoint(location);
  return location;
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    useMemoryStore = true;
    console.log("MONGODB_URI not found. Using in-memory data store.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    useMemoryStore = false;
    console.log("Connected to MongoDB.");
  } catch (error) {
    useMemoryStore = true;
    console.log("MongoDB connection failed. Falling back to in-memory store.");
    console.log(error.message);
  }
}

async function ensureSeedData() {
  if (useMemoryStore) {
    if (!memoryLocations.length) {
      memoryLocations = sampleLocations.map((location, index) =>
        toClientLocation({
          id: `memory-${index + 1}`,
          ...buildQueueLocation(location),
        })
      );
    }

    return;
  }

  const existingCount = await Location.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const documents = sampleLocations.map((location) => buildQueueLocation(location));
  await Location.insertMany(documents);
}

async function getAllLocations() {
  if (useMemoryStore) {
    memoryLocations = memoryLocations.map((location) =>
      toClientLocation(
        buildQueueLocation({
          ...location,
          gpsCrowdCount: getGpsCrowdCount(location),
        })
      )
    );
    return memoryLocations;
  }

  const locations = await Location.find().sort({ name: 1 }).lean();
  return locations.map((location) =>
    toClientLocation(
      buildQueueLocation({
        ...location,
        gpsCrowdCount: getGpsCrowdCount(location),
      })
    )
  );
}

async function getLocationById(locationId) {
  if (useMemoryStore) {
    const location = memoryLocations.find((item) => item.id === locationId) || null;
    return location
      ? toClientLocation(
          buildQueueLocation({
            ...location,
            gpsCrowdCount: getGpsCrowdCount(location),
          })
        )
      : null;
  }

  const location = await Location.findById(locationId).lean();
  return location
    ? toClientLocation(
        buildQueueLocation({
          ...location,
          gpsCrowdCount: getGpsCrowdCount(location),
        })
      )
    : null;
}

async function addLocation({ name, category, lat, lng, geoFenceRadiusMeters }) {
  const newLocation = buildQueueLocation({
    name,
    category,
    manualEntries: [],
    activeUsers: Math.floor(Math.random() * 5),
    gpsCrowdCount: 0,
    coordinates: {
      lat: Number(lat) || 0,
      lng: Number(lng) || 0,
    },
    geoFenceRadiusMeters: Number(geoFenceRadiusMeters) || 250,
    history: [],
  });

  if (useMemoryStore) {
    const duplicate = memoryLocations.find(
      (location) => location.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Location already exists.");
    }

    const createdLocation = toClientLocation({
      id: `memory-${Date.now()}`,
      ...newLocation,
    });

    memoryLocations = [...memoryLocations, createdLocation];
    return createdLocation;
  }

  const existing = await Location.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (existing) {
    throw new Error("Location already exists.");
  }

  const createdLocation = await Location.create(newLocation);
  return toClientLocation(createdLocation.toObject());
}

async function updateLocationQueue(locationId, people) {
  if (useMemoryStore) {
    memoryLocations = memoryLocations.map((location) => {
      if (location.id !== locationId) {
        return location;
      }

      const manualEntries = [...location.manualEntries, Number(people)].slice(
        -MAX_MANUAL_ENTRIES
      );

      return toClientLocation(
        buildQueueLocation({
          ...location,
          manualEntries,
          gpsCrowdCount: getGpsCrowdCount(location),
        })
      );
    });

    return getLocationById(locationId);
  }

  const location = await Location.findById(locationId);
  if (!location) {
    return null;
  }

  const manualEntries = [...location.manualEntries, Number(people)].slice(
    -MAX_MANUAL_ENTRIES
  );
  const nextState = buildQueueLocation({
    ...location.toObject(),
    manualEntries,
    gpsCrowdCount: getGpsCrowdCount(location.toObject()),
    history: location.history,
  });

  Object.assign(location, nextState);
  await location.save();

  return toClientLocation(location.toObject());
}

async function resetLocationQueue(locationId) {
  if (useMemoryStore) {
    memoryLocations = memoryLocations.map((location) => {
      if (location.id !== locationId) {
        return location;
      }

      return toClientLocation(
        buildQueueLocation({
          ...location,
          manualEntries: [],
          activeUsers: 0,
          gpsCrowdCount: getGpsCrowdCount(location),
          history: [],
        })
      );
    });

    return getLocationById(locationId);
  }

  const location = await Location.findById(locationId);
  if (!location) {
    return null;
  }

  const nextState = buildQueueLocation({
    ...location.toObject(),
    manualEntries: [],
    activeUsers: 0,
    gpsCrowdCount: getGpsCrowdCount(location.toObject()),
    history: [],
  });

  Object.assign(location, nextState);
  await location.save();

  return toClientLocation(location.toObject());
}

async function simulateActiveUsers() {
  if (useMemoryStore) {
    memoryLocations = memoryLocations.map((location) =>
      toClientLocation(
        buildQueueLocation({
          ...location,
          activeUsers: Math.floor(Math.random() * 15),
          gpsCrowdCount: getGpsCrowdCount(location),
        })
      )
    );

    return memoryLocations;
  }

  const locations = await Location.find();

  for (const location of locations) {
    const nextState = buildQueueLocation({
      ...location.toObject(),
      activeUsers: Math.floor(Math.random() * 15),
      gpsCrowdCount: getGpsCrowdCount(location.toObject()),
      history: location.history,
    });

    Object.assign(location, nextState);
    await location.save();
  }

  return getAllLocations();
}

async function ingestGpsSignal({ userId, lat, lng }) {
  gpsPresenceStore.set(userId, {
    lat: Number(lat),
    lng: Number(lng),
    timestamp: Date.now(),
  });

  if (useMemoryStore) {
    memoryLocations = memoryLocations.map((location) =>
      toClientLocation(
        buildQueueLocation({
          ...location,
          gpsCrowdCount: getGpsCrowdCount(location),
        })
      )
    );

    return memoryLocations;
  }

  const locations = await Location.find();

  for (const location of locations) {
    const nextState = buildQueueLocation({
      ...location.toObject(),
      gpsCrowdCount: getGpsCrowdCount(location.toObject()),
      history: location.history,
    });

    Object.assign(location, nextState);
    await location.save();
  }

  return getAllLocations();
}

module.exports = {
  connectDatabase,
  ensureSeedData,
  getAllLocations,
  getLocationById,
  addLocation,
  updateLocationQueue,
  resetLocationQueue,
  simulateActiveUsers,
  ingestGpsSignal,
};
