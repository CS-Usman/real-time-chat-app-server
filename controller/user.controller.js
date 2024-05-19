import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";
import { filterObj } from "../utils/filterObj.js";
import FriendRequest from "../models/friendRequest.model.js";

export const getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: req.user,
  });
};

export const updateMe = async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const { user } = req;

  try {
    const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({
      verified: true,
    }).select("firstName lastName _id");

    const thisUser = req.user;
    const remainingUser = allUsers.filter(
      (user) =>
        !thisUser.friends.includes(user._id) &&
        user._id.toString() !== req.user._id.toString()
    );
    res.status(200).json({
      success: true,
      message: "Users found successfully",
      data: remainingUser,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};
export const getRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
    }).populate("sender", "_id firstName lastName");
    res.status(200).json({
      success: true,
      message: "Requests found successfully",
      data: requests,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const thisUser = await User.findById(req.user._id).populate(
      "friends",
      "_id firstName lastName"
    );

    res.status(200).json({
      success: true,
      message: "Friends found successfully",
      data: thisUser.friends,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};
