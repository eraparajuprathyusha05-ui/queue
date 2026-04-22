const express = require("express");
const {
  getAllLocations,
  getLocationById,
  addLocation,
  updateLocationQueue,
  resetLocationQueue,
  ingestGpsSignal,
} = require("../services/locationService");

const router = express.Router();

async function emitLocationsUpdate(req) {
  const locations = await getAllLocations();
  req.app.locals.io.emit("locations:updated", { locations });
}

router.get("/locations", async (_req, res) => {
  const locations = await getAllLocations();
  res.json(locations);
});

router.get("/queue/:locationId", async (req, res) => {
  const location = await getLocationById(req.params.locationId);

  if (!location) {
    return res.status(404).json({ message: "Location not found." });
  }

  res.json(location);
});

router.post("/update", async (req, res) => {
  const { locationId, people } = req.body;

  if (!locationId || typeof people !== "number" || people < 0) {
    return res.status(400).json({
      message: "locationId and a valid non-negative people value are required.",
    });
  }

  const location = await updateLocationQueue(locationId, people);

  if (!location) {
    return res.status(404).json({ message: "Location not found." });
  }

  await emitLocationsUpdate(req);
  res.json({ message: "Queue updated successfully.", location });
});

router.post("/add-location", async (req, res) => {
  const { name, category, lat, lng, geoFenceRadiusMeters } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Location name is required." });
  }

  try {
    const location = await addLocation({
      name: name.trim(),
      category: category || "Other",
      lat,
      lng,
      geoFenceRadiusMeters,
    });

    await emitLocationsUpdate(req);
    res.status(201).json({ message: "Location added successfully.", location });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/reset/:locationId", async (req, res) => {
  const location = await resetLocationQueue(req.params.locationId);

  if (!location) {
    return res.status(404).json({ message: "Location not found." });
  }

  await emitLocationsUpdate(req);
  res.json({ message: "Queue reset successfully.", location });
});

router.post("/gps-checkin", async (req, res) => {
  const { userId, lat, lng } = req.body;

  if (!userId || typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({
      message: "userId, lat, and lng are required for GPS crowd check-in.",
    });
  }

  const locations = await ingestGpsSignal({ userId, lat, lng });
  req.app.locals.io.emit("locations:updated", { locations });

  res.json({
    message: "GPS crowd signal recorded.",
    locations,
  });
});

module.exports = router;
