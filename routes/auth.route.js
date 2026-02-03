import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";

import { User } from "../models/user.model.js";
import { Transaction } from "../models/user.model.js";

const router = express.Router();

/* ======================
   MIDDLEWARE
====================== */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const generateEmailToken = () => crypto.randomBytes(32).toString("hex");

/* ======================
   AUTH ROUTES
====================== */

/* SIGNUP */
router.post(
  "/signup",
  [
    body("username").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateEmailToken();

    await User.create({
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
  }
);


router.post("/login", async (req, res) => {
console.log("BODY:",req.body);

return res.status(200).json({
    message: "Login route reached",
    body: req.body
});
});



/* ======================
   LOGIN ROUTE
====================== */
router.post("/login", async (req, res) => {
    console.log("req.body:", req.body);
  try {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send success response
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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* VERIFY EMAIL */
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ message: "Email verified successfully" });
});

/* RESEND VERIFICATION */
router.post("/resend-verification", authMiddleware, async (req, res) => {
  const token = generateEmailToken();

  await User.findByIdAndUpdate(req.userId, {
    emailVerificationToken: token,
    emailVerificationExpires: Date.now() + 30 * 60 * 1000,
  });

  res.json({ message: "Verification email sent", token });
});

/* UPDATE USER */
router.put("/update", authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { username, email },
    { new: true }
  );

  res.json({ message: "User updated", user });
});

/* CHANGE PASSWORD */
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match)
    return res.status(401).json({ message: "Old password incorrect" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
});

/* DELETE USER */
router.delete("/delete", authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.userId);
  res.json({ message: "Account deleted" });
});

/* ======================
   TRANSACTION ROUTES
====================== */

/* CREATE TRANSACTION */
router.post("/transaction/create", authMiddleware, async (req, res) => {
  const {
    type,
    amount,
    status,
    description,
    balanceBefore,
    balanceAfter,
  } = req.body;

  const transaction = await Transaction.create({
    user: req.userId,
    type,
    amount,
    status,
    description,
    balanceBefore,
    balanceAfter,
    reference: crypto.randomUUID(),
  });

  res.status(201).json({ message: "Transaction recorded", transaction });
});

/* USER TRANSACTION HISTORY */
router.get("/transaction/history", authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json({ transactions });
});

export default router;