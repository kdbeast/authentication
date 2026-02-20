import dotenv from "dotenv";
import express from "express";
import { createClient } from "redis";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";

dotenv.config();

await connectDB();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis Url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
