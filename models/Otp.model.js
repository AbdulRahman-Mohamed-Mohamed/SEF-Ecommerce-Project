import { model, Schema } from "mongoose";

//create otp Schema


const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        otp: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Attempts must be an integer",
            },
        },
        lastSentAt: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
            expires: 0,
        },
        userData: {
            type: Object,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);
//create OTP Model

const OTP = model("OTP", otpSchema);

export default OTP;