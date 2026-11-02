import { model, Schema } from "mongoose"

//create otp Schema

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    userData: {
        type: Object,
        default: null,
    },
},
    {
        timestamps: true,
    })


//create OTP Model

const OTP = model("OTP", otpSchema)

export default OTP;