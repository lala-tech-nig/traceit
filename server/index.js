import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './routes/authRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ninRoutes from './routes/ninRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adRoutes from './routes/adRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import verificatorRoutes from './routes/verificatorRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/nin', ninRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/verificator', verificatorRoutes);

app.get('/', (req, res) => {
    res.send('TraceIt API is running...');
});

// Connect DB then Start Server
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
};

startServer();

// Trigger nodemon restart
