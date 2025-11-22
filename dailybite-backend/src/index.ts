import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";

const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
