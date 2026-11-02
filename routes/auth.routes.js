
import express from "express";

import { sendRegisterOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register/send-otp", sendRegisterOtp);

export default router;
