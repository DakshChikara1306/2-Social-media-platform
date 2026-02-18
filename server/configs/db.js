
import mongoose from "mongoose";

const connectDB=async()=>{
  try {
   // Event listeners
    mongoose.connection.on('connected', () => {
      console.log("✅ Database connected successfully.");
    });

    mongoose.connection.on('disconnected', () => {
      console.log("⚠️ Database disconnected.");
    });
    await mongoose.connect(`${process.env.MONGODB_URL}/PingUp`);
  } catch (error) {
     console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;
