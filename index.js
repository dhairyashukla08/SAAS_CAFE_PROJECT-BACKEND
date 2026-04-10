import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createClient } from "redis";

import authRoutes from "./routes/auth-routes.js";
import menuRoutes from "./routes/menu-routes.js";
import orderRoutes from "./routes/order-routes.js";
import couponRoutes from "./routes/coupon-routes.js";
import analyticsRoutes from "./routes/analytics-routes.js";
import settingsRoutes from "./routes/settings-routes.js";
import tableRoutes from "./routes/table-routes.js";

import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

export const redisClient=createClient({
  url:process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error',(err)=>console.log('Redis Client Error',err));
(async()=>{
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Redis connection failed", error);
  }
})();

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
const limiter=rateLimit({
  windowMs:15*60*1000,
  max:100,
  standardHeaders:true,
  legacyHeaders:false,
  message:"Too many requests, please try again later."
})
app.use("/api/",limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});
app.set("socketio", io);
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("join_admin_room", () => {
    socket.join("admin_room");
    console.log("Admin joined the notification room");
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
  socket.on("join_order_room", (orderId) => {
  socket.join(orderId);
  console.log(`User joined room for order: ${orderId}`);
});
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/settings",settingsRoutes);
app.use("/api/tables", tableRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
