import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@hazjak/validation";
import * as ctrl from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.post("/verify-otp", validate(verifyOtpSchema), ctrl.verifyOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), ctrl.resetPassword);
router.post("/logout", ctrl.logout);
router.get("/me", authenticate, ctrl.me);

export default router;
