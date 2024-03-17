import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";
import { generateToken } from "../utils/generateToken.js";
import { filterObj } from "../utils/filterObj.js";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { sendEmail } from "../services/mailer.service.js";

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }
  try {
    const foundUser = await User.findOne({ email }).select("+password");

    if (
      !foundUser ||
      !(await foundUser.correctPassword(password, foundUser.password))
    )
      return next(new ErrorResponse("Email or password is incorrect", 400));

    res.status(200).json({
      success: true,
      message: "User login successful",
      token: generateToken(foundUser._id),
      data: {
        userId: foundUser._id,
      },
    });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const signUp = async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "password"
  );

  console.log(filteredBody);

  if (!email && !firstName && !lastName && !password) {
    return next(
      new ErrorResponse(
        "Please provide email,first name ,last name and password",
        400
      )
    );
  }

  if (password.length < 8) {
    return next(
      new ErrorResponse("password length less than 8 characters", 400)
    );
  }

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser.verified) {
      return next(new ErrorResponse("Email already exists", 409));
    } else if (existingUser) {
      await User.findOneAndUpdate({ email: email }, filteredBody, {
        new: true,
        validateModifiedOnly: true,
      });

      req.userId = existingUser._id;
      next();
    } else {
      const newUser = await User.create(filteredBody);
      req.userId = newUser._id;
      next();
    }

    // Return a success response with the user's information.
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

export const sendOTP = async (req, res, next) => {
  const { userId } = req;

  const newOtp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 mins

  try {
    const user = await User.findByIdAndUpdate(userId, {
      otpExpiryTime: otpExpiryTime,
    });

    user.otp = newOtp.toString();

    await user.save({ new: true, validateModifiedOnly: true });

    console.log(newOtp);

    try {
      await sendEmail({
        to: user.email,
        subject: "Verification OTP",
        text: `Your OTP is ${newOtp}.This is valid for 10 mins`,
      });
    } catch (error) {
      return next(
        new ErrorResponse(`Error sending mail : ${error.message}`, 500)
      );
    }

    res.status(200).json({
      success: true,
      message: "OTP Sent Sucessfully",
    });
  } catch (error) {
    return next(new ErrorResponse(`Server error : ${error.message}`, 500));
  }
};

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otpExpiryTime: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
      data: {
        userId: user._id
      }
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }

  if (!(await user.correctOTP(otp, user.otp))) {
    return res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  // OTP is correct

  user.verified = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token: generateToken(user._id),
    data: {
      userId: user._id,
    },
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return next(
      new ErrorResponse("No email exists with given email address", 400)
    );
  }

  try {
    const resetToken = user.createPasswordResetToken();
    const resetUrl = `http://localhost:3001/users/auth/reset-password/?code=${resetToken}`;
    await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Password Request",
        text: `We have received password request if you have not sent that ignore this  email other click following link ${resetUrl}`,
      });
    } catch (error) {
      return next(
        new ErrorResponse(`Error sending mail : ${error.message}`, 500)
      );
    }
    res.status(200).json({
      success: true,
      message: "Reset Password link send to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(error.message, 500));
  }
};

export const resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has expired
  if (!user) {
    return next(new ErrorResponse("Token is invalid or expired", 400));
  }

  // update user password and set resetToken to be undefined

  try {
    user.password = req.body.password;
    user.passwordConfirm = req.body.confirmPassword;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset Password Confirmation",
      text: `Updated your password successfully`,
    });
    res.status(200).json({
      status: "success",
      message: "Password Reseted Successfully",
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Error sending mail : ${error.message}`, 500)
    );
  }
};
