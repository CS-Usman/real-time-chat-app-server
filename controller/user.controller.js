import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";
import { filterObj } from "../utils/filterObj.js";

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
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        filteredBody,
      },
      {
        new: true,
        validateModifiedOnly: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};
