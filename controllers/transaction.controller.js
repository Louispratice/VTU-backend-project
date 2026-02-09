import crypto from "crypto";
import { Transaction } from "../models/user.model.js";

export const createTransaction = async (req, res) => {
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

    res.status(201).json({ message: "Transaction recorded", transaction });
};

export const getTransactionHistory = async (req, res) => {
    const { type, status } = req.query;

    const filter = { user: req.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({
        createdAt: -1,
    });

    res.json({ transactions });
};

export const getTransactionByReference = async (req, res) => {
    const transaction = await Transaction.findOne({
        reference: req.params.reference,
        user: req.userId,
    });

    if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

    res.json(transaction);
};
