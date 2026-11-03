import { model, Schema } from "mongoose"
import slugify from "slugify"

//create review Schema

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        maxlength: 200
    }
})

//create Product Schema

const productSchema = new Schema({
    name: {
        type: String,
        maxlength: 200,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique:true,
    },
    shortDescription: {
        type: String,
        maxlength: 200,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discountPrice: {
        type: Number,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    sku: {
        type: String,
        unique:true,
    },
    images: [{
        type: String,
        required: true,
    }],
    category: {
        type: String,
        required: true,
        lowercase:true,
    },
    subcategory: {
        type: String,
    },
    brand: {
        type: String,
    },
    tags: {
        type: [String],
    },
    reviews: [reviewSchema],
    averageRating: {
        type: Number,
    },
    numReviews: {
        type: Number,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
},
    {
        timestamps: true,
    })


//create Product Model

const Product = model("Product", productSchema)

export default Product;