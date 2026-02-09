import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("username").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  asyncWrapper(authController.signup)
);

router.post("/login", asyncWrapper(authController.login));

router.post("/verify-email", asyncWrapper(authController.verifyEmail));

router.post(
  "/resend-verification",
  authMiddleware,
  asyncWrapper(authController.resendVerification)
);

router.put(
  "/update",
  authMiddleware,
  asyncWrapper(authController.updateUser)
);

router.post(
  "/change-password",
  authMiddleware,
  asyncWrapper(authController.changePassword)
);

router.delete(
  "/delete",
  authMiddleware,
  asyncWrapper(authController.deleteUser)
);

export default router;