import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED");
        process.exit(1);
    }
};