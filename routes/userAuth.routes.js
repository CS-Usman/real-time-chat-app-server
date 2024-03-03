import express from "express";
import { login, signUp } from "../controller/userAuth.controller.js"

const userAuthRouter = express.Router();


userAuthRouter.post("/login", login);
userAuthRouter.post("/sign-up", signUp);

export default userAuthRouter;
