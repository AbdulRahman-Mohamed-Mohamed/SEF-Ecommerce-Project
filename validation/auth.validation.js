
import Joi from "joi";

// Validation for sending registration OTP
export const sendRegisterOtpSchema = Joi.object({
    username: Joi.string().trim().required(),

    email: Joi.string().trim().lowercase().email().required(),

    password: Joi.string().min(15).max(72, "utf8").required(),
}).unknown(false);

// Validation for verifying registration OTP
export const verifyRegisterOtpSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),

    otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
}).unknown(false);
