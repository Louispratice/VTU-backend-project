import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { Transaction } from "../models/user.model.js"; // Transaction schema
import { User } from "../models/user.model.js";        // Optional, if needed

const router = express.Router();

/* ======================
   AUTH MIDDLEWARE
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

/* ======================
   CREATE TRANSACTION
====================== */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      amount,
      status = "pending",
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

    res.status(201).json({
      message: "Transaction recorded successfully",
      transaction,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   GET USER TRANSACTION HISTORY
====================== */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { type, status } = req.query;

    const filter = { user: req.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   GET SINGLE TRANSACTION
====================== */
router.get("/:reference", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      reference: req.params.reference,
      user: req.userId,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;