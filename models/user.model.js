import mongoose from "mongoose";

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,
    walletBalance: { type: Number, default:0},
  },
  
  { timestamps: true }
);

/* =========================
   TRANSACTION SCHEMA
========================= */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "airtime",
        "data",
        "electricity",
        "tv",
        "wallet_funding",
        "transfer",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    reference: {
      type: String,
      unique: true,
      required: true,
    },

    description: String,

    balanceBefore: Number,
    balanceAfter: Number,
  },
  { timestamps: true }
);

/* =========================
   MODELS EXPORT
========================= */
const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

export { User, Transaction };