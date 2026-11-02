import { model, Schema } from "mongoose";
import bcryptjs from "bcryptjs";

/// creating address Schema

const addressSchema = new Schema({
    country: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    street: {
        type: String,
        trim: true,
    },
    building: {
        type: String,
        trim: true,
    },
    postalCode: {
        type: String,
        trim: true,
    },
    defaultAddress: {
        type: Boolean,
        default: false,
    },
},
    {
        _id: false,
    })

/// creating user Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false, // hide field password from query results by default
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    avatar: {
        type: String,
        default: "http://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer",
    },
    addresses: [addressSchema],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    },],
    isVerified: {
        type: Boolean,
        default: false
    },registerOtp: {
    type: String,
    select: false,
},
registerOtpExpire: {
    type: Date,
    select: false,
},
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
},
    {
        timestamps: true,
    })

/// hashing password before saving data in DB

userSchema.pre("save", async function () {
    const user = this
    if (!user.isModified("password")) {
        return
    }
    user.password = await bcryptjs.hash(user.password, 10)
})

/// comparing input data to saving password in DB

userSchema.methods.comparePassword = async function (enteredPass) {
    return await bcryptjs.compare(enteredPass, this.password)
}

/// creating user Model

const User = model("User", userSchema)

export default User;