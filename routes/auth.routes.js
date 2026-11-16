

import express from "express";

import {
    sendRegisterOtp,
    verifyRegisterOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);

export default router;
