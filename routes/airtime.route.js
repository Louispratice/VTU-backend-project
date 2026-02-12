import express from "express";
import * as dataController from "../controllers/data.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";
import { purchaseAirtime } from "../controllers/airtime.controller.js";

const router = express.Router();

//router.get("/plans", authMiddleware, asyncWrapper(dataController.getPlans));

router.post("/", authMiddleware, asyncWrapper(purchaseAirtime));

export default router;
