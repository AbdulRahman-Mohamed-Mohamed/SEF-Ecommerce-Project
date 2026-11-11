import { model, Schema } from "mongoose"
import slugify from "slugify"

// create image schema

const imageSchema = new Schema({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
})

//create review Schema

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
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
        maxlength: 500,
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
        validate(val) {
            return val === 0 || val < this.price //if price=0 ,discount=0
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
    images: {
        type: [imageSchema],
        validate(val) {
            return val.length > 0
        }
    },
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
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
},
    {
        timestamps: true,
    })

// create slugify for product name before validate data

productSchema.pre("validate", function () {
    if (!this.isModified("name")) {
        return
    }
    this.slug = slugify(this.name, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case
        strict: true,     // strip special characters except replacement, defaults to `false`
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
    })
})


// create calcAverageRating()

productSchema.methods.calcAverageRating = function () {
    this.numReviews = this.reviews.length
    const totalRating = this.reviews.reduce(
        (acc, current) => acc + current.rating, 0)
    this.averageRating = this.numReviews === 0 ? 0 : totalRating / this.numReviews
}

//create Text index on (name , description , brand)

productSchema.index({
    name: "text",
    description: "text",
    brand: "text"
})

/// create Normal Index on ( brand , price , category , averageRating , createdAt)

productSchema.index({ brand: -1 })
productSchema.index({ price: -1 })
productSchema.index({ category: -1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ createdAt: -1 })

//create Product Model

const Product = model("Product", productSchema)

export default Product;