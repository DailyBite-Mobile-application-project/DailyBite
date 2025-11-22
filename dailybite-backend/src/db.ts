import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL!;

export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("MongoDB error:", err);
    }
}
