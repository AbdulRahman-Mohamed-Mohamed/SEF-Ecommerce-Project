import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "SEF Ecommerce API is running" });
});

import connectToDB from "./DB/mongoose.js";

async function startServer() {
    await connectToDB();

    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    });
}

startServer();
