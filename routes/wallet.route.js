import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { User, Transaction } from "../models/user.model.js";

const router = express.Router();

/* AUTH MIDDLEWARE */
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

/* GET WALLET BALANCE */
router.get("/balance", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ walletBalance: user.walletBalance });
});

/* FUND WALLET */
router.post("/fund", authMiddleware, async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  const user = await User.findById(req.userId);
  const balanceBefore = user.walletBalance;
  user.walletBalance += amount;
  await user.save();

  const transaction = await Transaction.create({
    user: req.userId,
    type: "fund",
    amount,
    status: "success",
    reference: crypto.randomUUID(),
    description: description || "Wallet funding",
    balanceBefore,
    balanceAfter: user.walletBalance,
  });

  res.json({ message: "Wallet funded", walletBalance: user.walletBalance, transaction });
});

/* DEDUCT WALLET */
router.post("/deduct", authMiddleware, async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  const user = await User.findById(req.userId);
  if (user.walletBalance < amount) return res.status(400).json({ message: "Insufficient balance" });

  const balanceBefore = user.walletBalance;
  user.walletBalance -= amount;
  await user.save();

  const transaction = await Transaction.create({
    user: req.userId,
    type: "purchase",
    amount,
    status: "success",
    reference: crypto.randomUUID(),
    description: description || "Wallet deduction",
    balanceBefore,
    balanceAfter: user.walletBalance,
  });

  res.json({ message: "Purchase successful", walletBalance: user.walletBalance, transaction });
});

export default router;