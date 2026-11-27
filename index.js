
import "dotenv/config";

import express from "express";
import connectDB from "./DB/mongoose.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "SEF Ecommerce API is running"
    });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Start Server
const startServer = async () => {
    try {
        // Connect to Database first
        await connectDB();

        // Start listening only after successful connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
