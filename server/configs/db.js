import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    isConnected = conn.connections[0].readyState === 1;
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default connectDB;
