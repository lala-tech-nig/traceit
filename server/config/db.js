// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error with MongoDB: ${error.message}`);
//         process.exit(1);
//     }
// };

// export default connectDB;



import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.set('debug', true);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("========== MONGODB ERROR ==========");
        console.error(error);
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
        console.error("Reason:", error.reason);
        console.error("==================================");
        process.exit(1);
    }
};

export default connectDB;