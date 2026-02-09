import crypto from "crypto";
import { User, Transaction } from "../models/user.model.js";

export const getBalance = async (req, res) => {
    const user = await User.findById(req.userId);
    res.json({ walletBalance: user.walletBalance });
};

export const fundWallet = async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.userId);
    const balanceBefore = user.walletBalance;
    user.walletBalance += amount;
    await user.save();

    const transaction = await Transaction.create({
        user: req.userId,
        type: "wallet_funding",
        amount,
        status: "success",
        reference: crypto.randomUUID(),
        description: description || "Wallet funding",
        balanceBefore,
        balanceAfter: user.walletBalance,
    });

    res.json({ message: "Wallet funded", walletBalance: user.walletBalance, transaction });
};

export const deductWallet = async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.userId);
    if (user.walletBalance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const balanceBefore = user.walletBalance;
    user.walletBalance -= amount;
    await user.save();

    const transaction = await Transaction.create({
        user: req.userId,
        type: "purchase", // Keeping original enum value for now, though not in schema enum list
        amount,
        status: "success",
        reference: crypto.randomUUID(),
        description: description || "Wallet deduction",
        balanceBefore,
        balanceAfter: user.walletBalance,
    });

    res.json({ message: "Purchase successful", walletBalance: user.walletBalance, transaction });
};
