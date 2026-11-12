
import { randomInt } from "node:crypto";
import bcryptjs from "bcryptjs";

import User from "../models/User.model.js";
import OTP from "../models/Otp.model.js";
import sendEmail from "../utils/sendEmail.js";

export const sendRegisterOtp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required",
            });
        }

        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Check if user already exists
        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (user && user.isVerified) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        // 4. Generate 6-digit OTP
        const otp = randomInt(100000, 1000000).toString();

        // 5. Hash OTP before storing it
        const hashedOtp = await bcryptjs.hash(otp, 10);

        // 6. Set OTP expiration (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 7. Save OTP and registration data in OTP Model
        const otpRecord = await OTP.findOneAndUpdate(
            { email: normalizedEmail },
            {
                email: normalizedEmail,
                otp: hashedOtp,
                expiresAt,
                userData: {
                    username: username.trim(),
                    email: normalizedEmail,
                    password,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        // 8. Send OTP email
        try {
            await sendEmail({
                to: normalizedEmail,
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

            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(500).json({
                message: "Failed to send verification email",
            });
        }

        // 9. Send response
        return res.status(200).json({
            message: "OTP sent successfully. Please check your email.",
        });

    } catch (error) {
        console.error("Register OTP Error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

