import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1d" })
}