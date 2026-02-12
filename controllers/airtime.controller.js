import axios from "axios";
import crypto from "crypto";
import { User, Transaction } from "../models/user.model.js";

export const purchaseAirtime = async (req, res) => {
  const { network_id, phone, amount } = req.body;

  if (!network_id || !phone || !amount) {
    return res.status(400).json({ message: "Network, phone, and amount are required" });
  }

  // 1. Check User Balance
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.walletBalance < amount) {
    return res.status(400).json({ message: "Insufficient wallet balance" });
  }

  // 2. Call DataStation API
  try {
    const response = await axios.post(
      "https://datastationapi.com/api/topup/",
      {
        network: network_id,
        mobile_number: phone,
        amount: amount,
        airtime_type: "VTU"
      },
      {
        headers: {
          "Authorization": `Token ${process.env.DATASTATION_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 3. If Success, Deduct Balance and Record Transaction
    const balanceBefore = user.walletBalance;
    user.walletBalance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      user: req.userId,
      type: "airtime",
      amount,
      status: "success",
      reference: crypto.randomUUID(),
      description: `Airtime Purchase: ${network_id} (${phone})`,
      balanceBefore,
      balanceAfter: user.walletBalance,
    });

    res.json({
      message: "Airtime purchase successful",
      data: response.data,
      transaction
    });

  } catch (error) {
    console.error("Airtime API Error:", error.response?.data || error.message);

    // Create a failed transaction record
    await Transaction.create({
      user: req.userId,
      type: "airtime",
      amount,
      status: "failed",
      reference: crypto.randomUUID(),
      description: `Failed Airtime Purchase: ${network_id} (${phone})`,
      balanceBefore: user.walletBalance,
      balanceAfter: user.walletBalance,
    });

    res.status(500).json({
      message: "Airtime purchase failed",
      error: error.response?.data || error.message
    });
  }
};