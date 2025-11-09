/*
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
//app.use(cors());
app.use(
  cors({
    origin: [
      "https://mini-bus-tracker-frontend.vercel.app",
      "https://mini-bus-tracker-frontend.vercel.app/driver",
      "https://mini-bus-tracker-frontend.vercel.app/admin"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);


app.use(express.json());

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*" },
// });
const io = new Server(server, {
  cors: {
    origin: [
      "https://mini-bus-tracker-frontend.vercel.app",
      "https://mini-bus-tracker-frontend.vercel.app/driver",
      "https://mini-bus-tracker-frontend.vercel.app/admin"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mini-bus-tracker";

// ✅ Schema
const locationSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", locationSchema);

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Socket Events
io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // 🟢 Driver sending location updates
  socket.on("location-update", async (data) => {
    console.log("📍 Location update received:", data);

    if (!data.busId || !data.lat || !data.lng) return;

    // Save/update in DB
    await Location.findOneAndUpdate({ busId: data.busId }, data, {
      upsert: true,
      new: true,
    });

    // Broadcast to all admins
    io.emit("bus-location", data);
  });

  // 🟡 Admin requesting previous locations
  socket.on("request-last-locations", async () => {
    const locs = await Location.find({});
    socket.emit("last-locations", locs);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Server start
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
*/
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ CORS setup for your Vercel frontend
app.use(
  cors({
    origin: ["https://mini-bus-tracker-frontend.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

// ✅ Socket.IO with same CORS
const io = new Server(server, {
  cors: {
    origin: "https://mini-bus-tracker-frontend.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mini-bus-tracker";

// ✅ Schema
const locationSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", locationSchema);

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Socket Events
io.on("connection", (socket) => {
  const origin = socket.handshake.headers.origin;
  console.log("🌐 Client connected from:", origin);

  // 🟢 Driver sending location updates
  socket.on("location-update", async (data) => {
    console.log("📍 Location update received:", data);

    if (!data.busId || !data.lat || !data.lng) return;

    await Location.findOneAndUpdate({ busId: data.busId }, data, {
      upsert: true,
      new: true,
    });

    // Broadcast to all admins
    io.emit("bus-location", data);
  });

  // 🟡 Admin requesting previous locations
  socket.on("request-last-locations", async () => {
    const locs = await Location.find({});
    socket.emit("last-locations", locs);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// ✅ Server start
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
