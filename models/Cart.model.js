
import { model, Schema } from "mongoose";

// Cart Item Schema
const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
});

// Coupon Schema
const couponSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"],
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    return (
                        this.discountType !== "percentage" ||
                        value <= 100
                    );
                },
                message: "Percentage discount cannot exceed 100",
            },
        },
    },
    { _id: false }
);

// Cart Schema
const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: {
            type: [cartItemSchema],
            default: [],
        },
        coupon: {
            type: couponSchema,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Calculate subtotal
cartSchema.virtual("subtotal").get(function () {
    return this.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
});

// Calculate discount amount
cartSchema.virtual("discountAmount").get(function () {
    if (!this.coupon) return 0;

    let discount = 0;

    if (this.coupon.discountType === "percentage") {
        discount =
            (this.subtotal * this.coupon.discountValue) / 100;
    } else if (this.coupon.discountType === "fixed") {
        discount = Math.min(
            this.coupon.discountValue,
            this.subtotal
        );
    }

    return Math.round(discount * 100) / 100;
});

// Calculate total
cartSchema.virtual("total").get(function () {
    return Math.max(0, this.subtotal - this.discountAmount);
});

// Calculate total item count
cartSchema.virtual("itemCount").get(function () {
    return this.items.reduce(
        (count, item) => count + item.quantity,
        0
    );
});

// Create Cart Model
const Cart = model("Cart", cartSchema);

export default Cart;
