import dotenv from "dotenv";
import express from "express";
import { createClient } from "redis";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.route.js";
dotenv.config();
connectDB();
export const redisClient = createClient({
    url: process.env.REDIS_URL || "",
});
redisClient
    .connect()
    .then(() => {
    console.log("Redis connected successfully");
})
    .catch((error) => {
    console.error("Error connecting to Redis:", error);
});
const app = express();
app.use("/api/v1", userRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map