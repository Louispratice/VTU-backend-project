import axios from "axios";
import crypto from "crypto";
import { User, Transaction } from "../models/user.model.js";

export const purchaseElectricity = async (req, res) => {
  const { disco_name, mobile_number, amount, meter_number, MeterType } = req.body;

  if (!disco_name || !mobile_number || !amount || !meter_number || !MeterType) {
    return res.status(400).json({ message: "Disco name, mobile number, amount, meter number, and meter type are required" });
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
      "https://datastationapi.com/api/billpayment/",
      {
        disco_name,
        amount,
        meter_number,
        MeterType,
        mobile_number
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
      type: "electricity",
      amount,
      status: "success",
      reference: crypto.randomUUID(),
      description: `Electricity Bill: ${disco_name} (${meter_number})`,
      balanceBefore,
      balanceAfter: user.walletBalance,
    });

    res.json({
      message: "Electricity purchase successful",
      data: response.data,
      transaction
    });

  } catch (error) {
    console.error("Electricity API Error:", error.response?.data || error.message);

    // Create a failed transaction record
    await Transaction.create({
      user: req.userId,
      type: "electricity",
      amount,
      status: "failed",
      reference: crypto.randomUUID(),
      description: `Failed Electricity Bill: ${disco_name} (${meter_number})`,
      balanceBefore: user.walletBalance,
      balanceAfter: user.walletBalance,
    });

    res.status(500).json({
      message: "Electricity purchase failed",
      error: error.response?.data || error.message
    });
  }
};