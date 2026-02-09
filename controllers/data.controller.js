import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { User, Transaction } from "../models/user.model.js";

const DATA_PLANS_FILE = path.join(process.cwd(), "data", "data_plans.json");

export const getPlans = async (req, res) => {
    const data = await fs.readFile(DATA_PLANS_FILE, "utf-8");
    const plans = JSON.parse(data);
    res.json({ plans });
};

export const purchaseData = async (req, res) => {
    const { network_id, mobile_number, plan_id, Ported_number } = req.body;

    if (!network_id || !mobile_number || !plan_id) {
        return res.status(400).json({ message: "Network, mobile number, and plan ID are required" });
    }

    // 1. Validate Plan and Get Amount
    const data = await fs.readFile(DATA_PLANS_FILE, "utf-8");
    const plans = JSON.parse(data);
    const selectedPlan = plans.find(p => p.id === plan_id);

    if (!selectedPlan) {
        return res.status(404).json({ message: "Data plan not found" });
    }

    const amount = selectedPlan.amount;

    // 2. Check User Balance
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // 3. Call DataStation API
    try {
        const response = await axios.post(
            "https://datastationapi.com/api/data/",
            {
                network: network_id,
                mobile_number,
                plan: plan_id,
                Ported_number: Ported_number || false
            },
            {
                headers: {
                    "Authorization": "Token 6dc4deabae242ff77c992f7277ba47cbb7c95486",
                    "Content-Type": "application/json"
                }
            }
        );

        // 4. If Success, Deduct Balance and Record Transaction
        const balanceBefore = user.walletBalance;
        user.walletBalance -= amount;
        await user.save();

        const transaction = await Transaction.create({
            user: req.userId,
            type: "data",
            amount,
            status: "success",
            reference: crypto.randomUUID(),
            description: `Data Purchase: ${selectedPlan.size} ${selectedPlan.network} (${mobile_number})`,
            balanceBefore,
            balanceAfter: user.walletBalance,
        });

        res.json({
            message: "Data purchase successful",
            data: response.data,
            transaction
        });

    } catch (error) {
        console.error("DataStation API Error:", error.response?.data || error.message);

        // Create a failed transaction record
        await Transaction.create({
            user: req.userId,
            type: "data",
            amount,
            status: "failed",
            reference: crypto.randomUUID(),
            description: `Failed Data Purchase: ${selectedPlan.size} ${selectedPlan.network} (${mobile_number})`,
            balanceBefore: user.walletBalance,
            balanceAfter: user.walletBalance,
        });

        res.status(500).json({
            message: "Data purchase failed",
            error: error.response?.data || error.message
        });
    }
};
