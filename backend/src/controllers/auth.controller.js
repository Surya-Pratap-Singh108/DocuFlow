import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const isUserExist = await User.findOne({ email: normalizedEmail });

        if (isUserExist) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: normalizedEmail,
            passwordHash: hashedPassword
        });
        await user.save();
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60 * 1000  //10 min
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000  //7 days
        });
        const userData = user.toObject();

        delete userData.passwordHash;
        delete userData.refreshToken;

        return res.status(201).json({
            message: 'User created successfully',
            user: userData
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
export const loginController = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const isUserExist = await User.findOne({ email: normalizedEmail });

        if (!isUserExist) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, isUserExist.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const refreshToken = generateRefreshToken(isUserExist._id);
        const accessToken = generateAccessToken(isUserExist._id);
        isUserExist.refreshToken = refreshToken;
        await isUserExist.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60 * 1000  //10 min
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000  //7 days
        });
        const userData = isUserExist.toObject();

        delete userData.passwordHash;
        delete userData.refreshToken;

        return res.status(200).json({
            message: "User logged in successfully",
            user: userData
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
