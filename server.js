import http from "http";
import app from "./index.js";
import { Server } from "socket.io";
import "dotenv/config";

import { connectDB } from "./config/dbConfig.js";
import User from "./models/user.model.js";
import FriendRequest from "./models/friendRequest.model.js";

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
    // console.log(JSON.stringify(socket.handshake.query))
    const userId = socket.handshake.query["userId"];
    const socketId = socket.id;

    console.log("user connected", socketId);

    if (Boolean(userId)) {
        await User.findByIdAndUpdate(userId, { socketId: socketId });
    }

    socket.on("friend_request", async (data) => {
        console.log(data.to);


        const to = await User.findById(data.to).select("socketId");
        const from = await User.findById(data.from).select("socketId");

        await FriendRequest.create({
            sender: data.from,
            recipient: data.to
        })

        // emit event => new_friend_request

        //TODO => create a friend request
        io.to(to.socketId).emit("new_friend_request", {
            message: "New Friend Request Received"
        });
        io.to(from.socketId).emit("request_sent", {
            message: "Request Send Successfully"
        });
        // const to =await User.findByIdAndUpdate(userId,)
    });

    socket.on("accept_request", async (data) => {
        console.log(data);
        const requestDoc = await FriendRequest.findById(data.requestId);
        console.log(requestDoc);

        const sender = await User.findById(requestDoc.sender);
        const receiver = await User.findById(requestDoc.recipient)

        sender.friends.push(requestDoc.recipient);
        receiver.friends.push(requestDoc.sender);

        await receiver.save({ new: true, validateModifiedOnly: true });
        await sender.save({ new: true, validateModifiedOnly: true });

        await FriendRequest.findByIdAndDelete(data.requestId);

        io.to(sender.socketId).emit("request_accepted", {
            message: "Friend Request Accepted"
        });
        io.to(receiver.socketId).emit("request_accepted", {
            message: "Friend Request Accepted"

        });
    });

    socket.on("end", async () => {
        console.log("closing connection");
        socket.disconnect(0);
    })
});

process.on("unhandledRejection", (error) => {
    console.log(`Logged Error : ${error}`);
    server.close(() => process.exit(1));
});
