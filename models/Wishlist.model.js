import { model, Schema } from "mongoose";

const wishlistSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
         },
        product: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
        
],

    },
    {
        timestamps: true,
    }
);
wishlistSchema.pre(["find", "findOne"], function () {
    this.populate("product");
});
const Wishlist = model("Wishlist", wishlistSchema);

export default Wishlist;