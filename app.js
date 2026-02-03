import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";



// Import routes
import authRoutes from "./routes/auth.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import walletRoutes from "./routes/wallet.route.js"; // Wallet

dotenv.config();

const app = express(); 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);

// Health check
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

export default app; // <-- Export AFTER declaration
