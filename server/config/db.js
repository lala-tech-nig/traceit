import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            family: 4 // Force IPv4 (sometimes helps with DNS/Atlas issues)
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error(`Check if your IP is whitelisted (currently trying to connect with ${process.env.MONGO_URI.split('@')[1]})`);
        process.exit(1);
    }
};

export default connectDB;
