
import { randomInt } from "node:crypto";
import bcryptjs from "bcryptjs";

import User from "../models/User.model.js";
import OTP from "../models/Otp.model.js";
import sendEmail from "../utils/sendEmail.js";

// Send registration OTP
export const sendRegisterOtp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({
            email
        });

        // Reject registration if the email already exists
        if (user) {
            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        // Check 60s resend cooldown BEFORE bcrypt operations
        const now = new Date();

        const existingOtp = await OTP.findOne({
            email
        });

        if (existingOtp?.lastSentAt) {
            const elapsedTime =
                now.getTime() - existingOtp.lastSentAt.getTime();

            if (elapsedTime < 60 * 1000) {
                return res.status(429).json({
                    message: "Please wait 60 seconds before requesting another OTP.",
                });
            }
        }

        const otp = randomInt(100000, 1000000).toString();

        const hashedOtp = await bcryptjs.hash(otp, 10);

        // Hash password before storing temporary registration data
        const hashedPassword = await bcryptjs.hash(password, 10);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        let otpRecord;

        if (existingOtp) {
            otpRecord = await OTP.findOneAndUpdate(
                {
                    _id: existingOtp._id,
                    lastSentAt: existingOtp.lastSentAt,
                },
                {
                    $set: {
                        otp: hashedOtp,
                        expiresAt,
                        userData: {
                            username,
                            email,
                            hashedPassword,
                        },
                        attempts: 0,
                        lastSentAt: now,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!otpRecord) {
                return res.status(429).json({
                    message: "Please wait 60 seconds before requesting another OTP.",
                });
            }
        } else {
            try {
                otpRecord = await OTP.create({
                    email,
                    otp: hashedOtp,
                    expiresAt,
                    userData: {
                        username,
                        email,
                        hashedPassword,
                    },
                    attempts: 0,
                    lastSentAt: now,
                });
            } catch (error) {
                if (error.code === 11000) {
                    return res.status(429).json({
                        message: "Please wait 60 seconds before requesting another OTP.",
                    });
                }

                throw error;
            }
        }

        // Send OTP email
        try {
            await sendEmail({
                to: email,
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

            // Delete only this OTP version if it has not been updated
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

        const otpRecord = await OTP.findOne({
            email
        });

        // Check if OTP exists
        if (!otpRecord) {
            return res.status(404).json({
                message: "OTP not found or expired",
            });
        }

        // Check OTP expiration
        if (otpRecord.expiresAt <= new Date()) {
            await OTP.deleteOne({
                _id: otpRecord._id,
                otp: otpRecord.otp,
            });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one.",
            });
        }

        // Check maximum attempts
        if (otpRecord.attempts >= 5) {
            return res.status(429).json({
                message: "Maximum OTP attempts reached. Please request a new OTP.",
            });
        }

        // Compare submitted OTP with hashed OTP
        const isOtpValid = await bcryptjs.compare(
            otp,
            otpRecord.otp
        );

        // Handle incorrect OTP atomically
        if (!isOtpValid) {
            const updatedOtp = await OTP.findOneAndUpdate(
                {
                    _id: otpRecord._id,
                    otp: otpRecord.otp,
                    attempts: { $lt: 5 },
                    expiresAt: { $gt: new Date() },
                },
                {
                    $inc: { attempts: 1 },
                },
                {
                    new: true,
                }
            );

            // OTP changed, expired, or attempts already reached
            if (!updatedOtp) {
                return res.status(429).json({
                    message: "Maximum OTP attempts reached or OTP is no longer valid.",
                });
            }

            if (updatedOtp.attempts >= 5) {
                return res.status(429).json({
                    message: "Maximum OTP attempts reached. Please request a new OTP.",
                });
            }

            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        // Check registration data
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

        // Check if the email is already registered
        const user = await User.findOne({
            email
        });

        if (user) {
            await OTP.deleteOne({
                _id: otpRecord._id,
                otp: otpRecord.otp,
            });

            return res.status(409).json({
                message: "This email is already registered",
            });
        }

        // Create new user and consume OTP in one transaction
        const session = await OTP.db.startSession();

        let newUser;

        try {
            await session.withTransaction(async () => {
                // Atomically consume OTP
                const consumedOtp = await OTP.findOneAndDelete(
                    {
                        _id: otpRecord._id,
                        otp: otpRecord.otp,
                        attempts: { $lt: 5 },
                        expiresAt: { $gt: new Date() },
                    },
                    { session }
                );

                if (!consumedOtp) {
                    const error = new Error("OTP is invalid, expired, or already used.");
                    error.code = "OTP_INVALID";
                    throw error;
                }

                // Create new user
                newUser = new User({
                    username: userData.username,
                    email,
                    password: userData.hashedPassword,
                    isVerified: true,
                });

                // Password is already hashed
                newUser.$locals.passwordAlreadyHashed = true;

                await newUser.save({ session });
            });
        } finally {
            await session.endSession();
        }

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

        if (error.code === "OTP_INVALID") {
            return res.status(400).json({
                message: "OTP is invalid, expired, or already used.",
            });
        }

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
