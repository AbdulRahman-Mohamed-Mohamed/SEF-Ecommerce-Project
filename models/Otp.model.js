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
        expiresAt: {
            type: Date,
            required: true,
            expires: 0, // MongoDB automatically deletes the document when it reaches its expiration time.
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
