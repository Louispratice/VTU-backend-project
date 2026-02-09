import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { User, Transaction } from "../models/user.model.js";

const generateEmailToken = () => crypto.randomBytes(32).toString("hex");

export const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateEmailToken();

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        emailVerificationToken: verifyToken,
        emailVerificationExpires: Date.now() + 30 * 60 * 1000,
    });

    res.status(201).json({
        message: "Signup successful. Verify your email.",
        verificationToken: verifyToken, // remove in production
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            walletBalance: user.walletBalance,
        },
    });
};

export const verifyEmail = async (req, res) => {
    const { token } = req.body;

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
};

export const resendVerification = async (req, res) => {
    const token = generateEmailToken();

    await User.findByIdAndUpdate(req.userId, {
        emailVerificationToken: token,
        emailVerificationExpires: Date.now() + 30 * 60 * 1000,
    });

    res.json({ message: "Verification email sent", token });
};

export const updateUser = async (req, res) => {
    const { username, email } = req.body;

    const user = await User.findByIdAndUpdate(
        req.userId,
        { username, email },
        { new: true }
    );

    res.json({ message: "User updated", user });
};

export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) return res.status(401).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
};

export const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account deleted" });
};
