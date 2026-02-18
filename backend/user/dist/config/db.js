import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error("Please provide a valid MONGO_URI in the environment variables");
}
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            dbName: "Chatappmicroserviceapp",
        });
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
//# sourceMappingURL=db.js.map