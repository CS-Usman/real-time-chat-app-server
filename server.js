import http from "http";
import app from "./index.js";
import { Server } from "socket.io";
import "dotenv/config";

import { connectDB } from "./config/dbConfig.js";
import User from "./models/user.model.js";

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// Connect to db
connectDB();

process.on("uncaughtException", (error) => {
  console.log(`Logged Error : ${error}`);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("server running on port ", PORT);
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.query["userId"];
  const socketId = socket.id;

  console.log("user connected", socketId);

  if (userId) {
    await User.findByIdAndUpdate(userId, { socketId: socketId });
  }
});

process.on("unhandledRejection", (error) => {
  console.log(`Logged Error : ${error}`);
  server.close(() => process.exit(1));
});
