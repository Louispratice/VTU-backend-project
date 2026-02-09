import express from "express";
import * as walletController from "../controllers/wallet.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";

const router = express.Router();

router.get("/balance", authMiddleware, asyncWrapper(walletController.getBalance));

router.post("/fund", authMiddleware, asyncWrapper(walletController.fundWallet));

router.post("/deduct", authMiddleware, asyncWrapper(walletController.deductWallet));

export default router;