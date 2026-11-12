import mongoose from "mongoose";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
};

export default connectDB;
