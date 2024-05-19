import http from "http";
import app from "./index.js";
import { Server } from "socket.io";
import "dotenv/config";
import path from "path";

import { connectDB } from "./config/dbConfig.js";
import User from "./models/user.model.js";
import FriendRequest from "./models/friendRequest.model.js";
import OneToOneMessage from "./models/OneToOneMessage.model.js";
import GroupChat from "./models/groupChat.model.js";

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
    await User.findByIdAndUpdate(userId, {
      socketId: socketId,
      status: "Online",
    });
  }

  socket.on("friend_request", async (data) => {
    console.log(data.to);

    const to = await User.findById(data.to).select("socketId");
    const from = await User.findById(data.from).select("socketId");

    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });

    // emit event => new_friend_request

    io.to(to?.socketId).emit("new_friend_request", {
      message: "New Friend Request Received",
    });
    io.to(from?.socketId).emit("request_sent", {
      message: "Request Send Successfully",
    });
    // const to =await User.findByIdAndUpdate(userId,)
  });

  socket.on("accept_request", async (data) => {
    console.log(data);
    const requestDoc = await FriendRequest.findById(data.requestId);
    console.log(requestDoc);

    const sender = await User.findById(requestDoc.sender);
    const receiver = await User.findById(requestDoc.recipient);

    sender.friends.push(requestDoc.recipient);
    receiver.friends.push(requestDoc.sender);

    await receiver.save({ new: true, validateModifiedOnly: true });
    await sender.save({ new: true, validateModifiedOnly: true });

    await FriendRequest.findByIdAndDelete(data.requestId);

    io.to(sender?.socketId).emit("request_accepted", {
      message: "Friend Request Accepted",
    });
    io.to(receiver?.socketId).emit("request_accepted", {
      message: "Friend Request Accepted",
    });
  });

  // get conversations of user
  socket.on("get_direct_conversation", async ({ userId }, callback) => {
    // find all the documents in participant array which contains required user
    const existingConversation = await OneToOneMessage.find({
      participants: { $all: [userId] },
    }).populate("participants", "firstName lastName _id email status");

    console.log(existingConversation);

    callback(existingConversation);
  });

  // get conversations of user
  socket.on("get_group_conversation", async ({ userId }, callback) => {
    // find all the documents in participant array which contains required user
    const existingGroupConversation = await GroupChat.find({
      participants: { $all: [userId] },
    }).populate("participants", "firstName lastName _id email status");

    console.log(existingGroupConversation);

    callback(existingGroupConversation);
  });

  socket.on("start_conversation", async (data) => {
    // data:{to from}
    const { to, from } = data;

    // check if there is existing conversation

    // query explanation => filter only those records which have only 2 elements in this field and all those elements must be either to or from
    const existingConversation = await OneToOneMessage.find({
      participants: { $size: 2, $all: [to, from] },
    }).populate("participants", "firstName lastName _id email status");

    console.log(existingConversation[0], "existing conversation");
    // if no existing conversation
    if (existingConversation.length === 0) {
      let newChat = await OneToOneMessage.create({
        participants: [to, from],
      });

      newChat = await OneToOneMessage.findById(newChat._id).populate(
        "participants",
        "firstName lastName _id email status"
      );
      socket.emit("start_chat", newChat);
    }
    // if  existing conversation
    else {
      socket.emit("start_chat", existingConversation[0]);
    }
  });

  // get messages of particular conversation

  socket.on("get_messages", async (data, callback) => {
    const { messages } = await OneToOneMessage.findById(
      data.conversationId
    ).select("messages");
    callback(messages);
  });

  // Handle text and link msg

  socket.on("text_message", async (data) => {
    console.log("Received Message", data);

    // data:{to from message conversationId type}

    const { to, from, message, conversationId, type } = data;
    const newMessage = {
      to,
      from,
      type,
      text: message,
      createdAt: Date.now(),
    };

    const toUser = await User.findById(to);
    const fromUser = await User.findById(from);

    // create conversation if it doesn't exists yet or add new message to message list
    const chat = await OneToOneMessage.findById(conversationId);
    chat.messages.push(newMessage);

    // save changes to db
    await chat.save({});

    // emit new_message -> to user
    io.to(toUser?.socketId).emit("new_message", {
      conversationId,
      message: newMessage,
    });
    // emit new_message -> from user
    io.to(fromUser?.socketId).emit("new_message", {
      conversationId,
      message: newMessage,
    });
  });

  socket.on("file_message", async (data) => {
    console.log("Received Message", data);

    // data:{to from text}

    // get file extension
    const fileExtension = path.extname(data.file.name);

    // generate unique filename
    const fileName = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;
    // upload file to aws s3

    // create conversation if it doesn't exists yet or add new message to message list

    // save changes to db

    // emit incoming_message -> to user

    // emit outgoing_message -> from user
  });

  socket.on("end", async (data) => {
    if (data.userId) {
      await User.findByIdAndUpdate(userId, { status: "Offline" });
    }

    console.log("closing connection");
    socket.disconnect(0);
  });
});

process.on("unhandledRejection", (error) => {
  console.log(`Logged Error : ${error}`);
  server.close(() => process.exit(1));
});
