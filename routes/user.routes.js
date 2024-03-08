import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { updateMe } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.patch("/update-me", verifyToken, updateMe);

export default userRouter;
