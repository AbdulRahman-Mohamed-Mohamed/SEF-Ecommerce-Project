
import { rateLimit } from "express-rate-limit";

// Rate limiter for sending registration OTP
export const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many OTP requests. Please try again later.",
    },
});

// Rate limiter for verifying registration OTP
export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many verification attempts. Please try again later.",
    },
});
