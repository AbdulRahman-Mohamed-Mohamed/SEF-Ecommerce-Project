
import { randomInt } from "node:crypto";
import bcryptjs from "bcryptjs";

import User from "../models/User.model.js";
import OTP from "../models/Otp.model.js";
import sendEmail from "../utils/sendEmail.js";

// Send registration OTP
export const sendRegisterOtp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Username, email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        // Reject registration if the email already exists
        if (user) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        const otp = randomInt(100000, 1000000).toString();

        const hashedOtp = await bcryptjs.hash(otp, 10);

        // Hash password before storing temporary registration data
        const hashedPassword = await bcryptjs.hash(password, 10);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const otpRecord = await OTP.findOneAndUpdate(
            { email: normalizedEmail },
            {
                email: normalizedEmail,
                otp: hashedOtp,
                expiresAt,
                userData: {
                    username: username.trim(),
                    email: normalizedEmail,
                    hashedPassword,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

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

            // Delete only this OTP record if it still has the same OTP
            await OTP.deleteOne({
                _id: otpRecord._id,
                otp: hashedOtp,
            });

            return res.status(500).json({
                message: "Failed to send verification email",
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully. Please check your email.",
        });

    } catch (error) {
        console.error("Register OTP Error:", error);

        // Handle duplicate key errors separately
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Verify registration OTP
export const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (
            typeof email !== "string" ||
            typeof otp !== "string" ||
            !email.trim() ||
            !/^\d{6}$/.test(otp)
        ) {
            return res.status(400).json({
                message: "Valid email and 6-digit OTP are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
        });

        if (!otpRecord) {
            return res.status(404).json({
                message: "OTP not found or expired",
            });
        }

        if (otpRecord.expiresAt <= new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one.",
            });
        }

        const isOtpValid = await bcryptjs.compare(
            otp,
            otpRecord.otp
        );

        if (!isOtpValid) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        const userData = otpRecord.userData;

        if (
            !userData ||
            !userData.username ||
            !userData.hashedPassword
        ) {
            return res.status(400).json({
                message: "Registration data is missing. Please register again.",
            });
        }

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (user) {
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        const newUser = new User({
            username: userData.username,
            email: normalizedEmail,
            password: userData.hashedPassword,
            isVerified: true,
        });

        // Tell the User model that the password is already hashed
        newUser.$locals.passwordAlreadyHashed = true;

        await newUser.save();

        await OTP.deleteOne({ _id: otpRecord._id });

        return res.status(201).json({
            message: "Email verified and account created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified,
            },
        });

    } catch (error) {
        console.error("Verify Register OTP Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
