import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  updateMe,
  getUsers,
  getRequests,
  getFriends,
  getMe,
} from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.get("/get-me", verifyToken, getMe);
userRouter.patch("/update-me", verifyToken, updateMe);
userRouter.get("/get-users", verifyToken, getUsers);
userRouter.get("get-friend-requests", verifyToken, getRequests);
userRouter.get("/get-friends", verifyToken, getFriends);

export default userRouter;
