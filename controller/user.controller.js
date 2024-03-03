import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";

export const getAllUsers = async (req, res, next) => {
    console.log(req.user);
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {};

    try {
        const users = await User.find(keyword).find({
            _id: { $ne: req.user._id }
        });
        console.log(users);
        res.send(users);
    } catch (error) {
        return next(new ErrorResponse(error, 500));

    }
}