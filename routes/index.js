import express from "express";
import userAuthRouter from "./userAuth.routes.js";
import userRouter from "./user.routes.js";

const router = express.Router();

router.use("/users/auth", userAuthRouter)
router.use("/users", userRouter);


export default router;