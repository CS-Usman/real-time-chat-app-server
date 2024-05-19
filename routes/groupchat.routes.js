import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createGroupChat,
  addToGroup,
  removeFromGroup,
  updateGroup,
} from "../controller/groupChat.controller.js";

const groupChatRouter = express.Router();

groupChatRouter.post("/group", verifyToken, createGroupChat);
groupChatRouter.patch("/group", verifyToken, updateGroup);
groupChatRouter.put("/group-add", verifyToken, addToGroup);
groupChatRouter.put("/group-remove", verifyToken, removeFromGroup);

export default groupChatRouter;
