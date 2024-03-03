import mongoose from "mongoose";

export const userModel = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false, },

}, { timestamps: true })

const User = mongoose.model("User", userModel);

export default User;