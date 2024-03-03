import User from "../models/user.model.js";
import ErrorResponse from "../utils/errorResponse.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    }
    try {
        const foundUser = await User.findOne({ email }).select("+password");

        if (!foundUser) return next(new ErrorResponse("Invalid credentials", 400));
        const matchPassword = await bcrypt.compare(password, foundUser.password);

        if (!matchPassword) return next(new ErrorResponse("Invalid credentials", 400));

        res.status(200).json({
            success: true,
            message: "User login successful",
            data: {
                _id: foundUser._id,
                email: foundUser.email,
                name: foundUser.name,
                isAdmin: foundUser.isAdmin,
                token: generateToken(foundUser._id)
            },
        });
    } catch (error) {

        return next(new ErrorResponse(error, 500));
    }
};

export const signUp = async (req, res, next) => {

    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return next(new ErrorResponse("Please provide an email,name and password", 400));
    }
    try {
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { name: name }
            ]
        });

        if (existingUser) {
            return next(new ErrorResponse("Email or username already exists", 409));
        }

        if (password.length < 8) {
            return next(new ErrorResponse("password length less than 8 characters", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email: email,
            password: hashedPassword,
            name: name,
        });

        // Return a success response with the user's information.
        if (newUser) {
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isAdmin: newUser.isAdmin,
                    token: generateToken(newUser._id)
                }
            });
        } else {
            // Return an error response if the user could not be created.
            return next(new ErrorResponse("Not able to create account", 500));
        }

    } catch (error) {
        return next(new ErrorResponse(error, 500));
    }
};