
import { randomInt } from "node:crypto";
import bcryptjs from "bcryptjs";

import User from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";

export const sendRegisterOtp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required",
            });
        }

        // Check if user already exists
        let user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (user && user.isVerified) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        // Generate a 6-digit OTP
        const otp = randomInt(100000, 1000000).toString();

        // Hash OTP before saving
        const hashedOtp = await bcryptjs.hash(otp, 10);

        // OTP expires after 10 minutes
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        if (!user) {
            // Create new unverified user
            user = new User({
                username,
                email: email.toLowerCase().trim(),
                password,
                registerOtp: hashedOtp,
                registerOtpExpire: otpExpire,
                isVerified: false,
            });
        } else {
            // Update OTP for existing unverified user
            user.registerOtp = hashedOtp;
            user.registerOtpExpire = otpExpire;
        }

        await user.save();

        // Send OTP email
        try {
            await sendEmail({
                to: user.email,
                subject: "Email Verification - SEF Ecommerce",
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2>Welcome to SEF Ecommerce!</h2>
                        <p>Your email verification code is:</p>
                        <h1 style="letter-spacing: 5px;">${otp}</h1>
                        <p>This code expires in 10 minutes.</p>
                        <p>Please do not share this code with anyone.</p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);

            user.registerOtp = undefined;
            user.registerOtpExpire = undefined;
            await user.save();

            return res.status(500).json({
                message: "Failed to send verification email",
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully. Please check your email.",
        });

    } catch (error) {
        console.error("Register OTP Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
