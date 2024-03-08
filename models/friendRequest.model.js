import mongoose from "mongoose";

const requestSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    recepient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const FriendRequest = mongoose.model("FriendRequest", requestSchema);

export default FriendRequest;
