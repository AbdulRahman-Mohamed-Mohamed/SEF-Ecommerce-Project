
import express from "express";

import {
    sendRegisterOtp,
    verifyRegisterOtp,
} from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";

import {
    sendRegisterOtpSchema,
    verifyRegisterOtpSchema,
} from "../validation/auth.validation.js";

import {
    sendOtpLimiter,
    verifyOtpLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post(
    "/register/send-otp",
    sendOtpLimiter,
    validate(sendRegisterOtpSchema),
    sendRegisterOtp
);

router.post(
    "/verify-otp",
    verifyOtpLimiter,
    validate(verifyRegisterOtpSchema),
    verifyRegisterOtp
);

export default router;

