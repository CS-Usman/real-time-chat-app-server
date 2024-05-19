import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";
import { filterObj } from "../utils/filterObj.js";
import GroupChat from "../models/groupChat.model.js";

export const createGroupChat = async (req, res, next) => {
  if (!req.body.name) {
    return next(new ErrorResponse("Group Name is missing", 400));
  }
  const filteredBody = filterObj(req.body, "name", "groupBio");
  filteredBody["admin"] = req.user._id;

  try {
    const createGroup = await new GroupChat(filteredBody);

    createGroup.participants.push(req.user._id);

    const group = await createGroup.save();

    res.status(201).json({
      success: true,
      message: "Group created sucessfully",
      data: group,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const updateGroup = async (req, res, next) => {
  const filteredBody = filterObj(req.body, "name", "groupBio", "admin");

  const { user } = req;

  try {
    const group = await GroupChat.findOneAndUpdate(
      { admin: user._id },
      filteredBody,
      {
        new: true,
      }
    )
      .populate("participants", "-password")
      .populate("admin", "-password");

    if (!group) {
      return next(
        new ErrorResponse("Group not found or only admin can update group", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const addToGroup = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorResponse("No user is selected", 400));
  }

  try {
    const group = await GroupChat.findOneAndUpdate(
      {
        admin: req.user._id,
      },
      {
        $push: { participants: userId },
      },
      {
        new: true,
        validateModifiedOnly: true,
      }
    )
      .populate("participants", "-password")
      .populate("admin", "-password");

    if (!group) {
      return next(
        new ErrorResponse("Group not found or only admin can add", 400)
      );
    }

    res.status(201).json({
      success: true,
      message: "user added to group sucessfully",
      data: group,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const removeFromGroup = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorResponse("No user is selected", 400));
  }

  try {
    const group = await GroupChat.findOneAndUpdate(
      {
        admin: req.user._id,
      },
      {
        $pull: { participants: userId },
      },
      {
        new: true,
      }
    )
      .populate("participants", "-password")
      .populate("admin", "-password");

    if (!group) {
      return next(
        new ErrorResponse("Group not found or only admin can remove", 400)
      );
    }

    res.status(201).json({
      success: true,
      message: "user removed from group successfully",
      data: group,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const getGroup = async (req, res, next) => {
  const { groupId } = req.params;

  if (!groupId) {
    return next(new ErrorResponse("Provide groupId in param", 400));
  }

  try {
    const group = await GroupChat.findById(groupId)
      .populate("participants", "-password")
      .populate("admin", "-password");

    if (!group) {
      return next(new ErrorResponse("Group not found", 400));
    }

    res.status(201).json({
      success: true,
      message: "fetched group successfully",
      data: group,
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};
