import http from "http";
import app from "./index.js";
import "dotenv/config";
import { connectDB } from "./config/dbConfig.js";

const server = http.createServer(app)
const PORT = process.env.PORT || 3001;

// Connect to db
connectDB();

process.on("uncaughtException", (error) => {
    console.log(`Logged Error : ${error}`);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log("server running on port ", PORT)
})


process.on("unhandledRejection", (error) => {
    console.log(`Logged Error : ${error}`);
    server.close(() => process.exit(1));
});