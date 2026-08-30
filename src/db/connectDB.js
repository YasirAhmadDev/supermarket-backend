import mongoose from 'mongoose'

const connectDb = () => {

    const MONGODB_URI = process.env.MONGODB_URI;
    
    const conRes = mongoose
    .connect(MONGODB_URI)
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
    
    return conRes;
}

export default connectDb;