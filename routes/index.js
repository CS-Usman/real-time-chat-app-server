import express from "express";
import userAuthRouter from "./userAuth.routes.js";
import userRouter from "./user.routes.js";
import groupChatRouter from "./groupchat.routes.js";

const router = express.Router();

router.use("/users/auth", userAuthRouter);
router.use("/users", userRouter);
router.use("/chat", groupChatRouter);

export default router;
