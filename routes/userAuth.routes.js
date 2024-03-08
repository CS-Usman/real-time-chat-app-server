import express from "express";
import {
  login,
  signUp,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controller/userAuth.controller.js";

const userAuthRouter = express.Router();

userAuthRouter.post("/login", login);
userAuthRouter.post("/sign-up", signUp, sendOTP);
userAuthRouter.post("/send-otp", sendOTP);
userAuthRouter.post("/verify-otp", verifyOTP);
userAuthRouter.post("/forgot-password", forgotPassword);
userAuthRouter.post("/reset-password", resetPassword);

export default userAuthRouter;
