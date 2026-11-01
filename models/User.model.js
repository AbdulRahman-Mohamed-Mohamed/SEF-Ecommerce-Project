import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/// creating address Schema

const addressSchema = Schema({
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
    postalcode: {
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

const userSchema = Schema({
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
        select: false,
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    age: {
        type: Number
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
    user.password = await bcrypt.hash(user.password, 10)
})

/// comparing input data to saving password in DB

userSchema.methods.comparePassword = async function (enteredPass) {
    return await bcrypt.compare(enteredPass, this.password)
}

/// creating user Model

const userModel = model("User", userSchema)

export default userModel;