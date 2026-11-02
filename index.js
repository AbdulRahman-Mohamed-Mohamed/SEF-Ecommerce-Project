

import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import dotenv from "dotenv";

import connectToDB from "./DB/mongoose.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SEF Ecommerce API is running",
    });
});

// Auth Routes
app.use("/api/auth", authRoutes);

async function startServer() {
    await connectToDB();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer();
