import mongoose from "mongoose";

const groupChatSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupBio: {
      type: String,
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        to: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        from: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: ["Text", "Media", "Document", "Link"],
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        text: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const GroupChat = mongoose.model("groupChatSchema", groupChatSchema);

export default GroupChat;
