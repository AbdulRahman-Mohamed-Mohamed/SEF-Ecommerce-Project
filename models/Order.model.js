import { model, Schema } from "mongoose"

// create order item Schema

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
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
    },
    image: {
        type: String,
    },
})

// create shipping Address Schema

const shippingAddressSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
    },
})


// create order Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "stripe", "paypal", "paymob"],
        default: "cash",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    transactionId: {
        type: String,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
    },
    tax: {
        type: Number,
    },
    discount: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
        default: "pending",
    },
    paidAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
    customerNote: {
        type: String,
        maxlength: 1000,
        trim: true,
    },
    adminNote: {
        type: String,
        maxlength: 1000,
        trim: true,
    }

},
    {
        timestamps: true,
    })



// create Order model

const Order = model("Order", orderSchema)

export default Order;
