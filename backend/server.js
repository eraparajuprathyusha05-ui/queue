const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const {
  connectDatabase,
  ensureSeedData,
  getAllLocations,
  simulateActiveUsers,
} = require("./services/locationService");
const locationRoutes = require("./routes/locationRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());

app.locals.io = io;

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "QueueSmart Pro backend is running.",
    frontend: allowedOrigin,
    health: "/health",
    endpoints: [
      "/locations",
      "/queue/:locationId",
      "/update",
      "/add-location",
      "/gps-checkin",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "QueueSmart Pro backend is running." });
});

app.use("/", locationRoutes);

io.on("connection", async (socket) => {
  const locations = await getAllLocations();
  socket.emit("locations:updated", { locations });
});

async function broadcastAllLocations() {
  const locations = await getAllLocations();
  io.emit("locations:updated", { locations });
}

async function startServer() {
  await connectDatabase();
  await ensureSeedData();
  await broadcastAllLocations();

  // Passive crowd simulation keeps the app feeling live even with no manual updates.
  setInterval(async () => {
    await simulateActiveUsers();
    await broadcastAllLocations();
  }, 5000);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`QueueSmart Pro backend running on http://localhost:${port}`);
  });
}

startServer();
