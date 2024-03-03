import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";
import "dotenv/config";
import User from "../models/user.model.js"

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer")) return next(new ErrorResponse("Unauthorized", 401));
    try {

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne({ _id: decoded.id });
        next();
    } catch (err) {
        return next(new ErrorResponse("Invalid token", 403));
    }
};
export default verifyToken;