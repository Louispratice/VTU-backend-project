import express from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  asyncWrapper(transactionController.createTransaction)
);

router.get(
  "/history",
  authMiddleware,
  asyncWrapper(transactionController.getTransactionHistory)
);

router.get(
  "/:reference",
  authMiddleware,
  asyncWrapper(transactionController.getTransactionByReference)
);

export default router;