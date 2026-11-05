import { model, Schema } from "mongoose"
import slugify from "slugify"
// Create Image Schema
const imageSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        trim: true,
    },
});
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
        unique: true,
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
        min: 0,
        validate: {
            validator: function (value) {
                return value == null || value < this.price;
            },
            message: "Discount price must be less than the original price",
        },
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    sku: {
        type: String,
        unique: true,
    },
    images: [imageSchema],

    category: {
        type: String,
        required: true,
        lowercase: true,
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
        default: 0,
        min: 0,
        max: 5,
    },
    numReviews: {
        type: Number,
        default: 0,
        min: 0,
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
// Generate slug before saving
productSchema.pre("validate", function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
        });
    }
});
const Product = model("Product", productSchema)

export default Product;