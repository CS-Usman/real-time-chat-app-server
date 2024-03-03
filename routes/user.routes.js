import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getAllUsers } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", verifyToken, getAllUsers);

export default userRouter;
