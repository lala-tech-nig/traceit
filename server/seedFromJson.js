import fs from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Device from './models/Device.js';
import Transfer from './models/Transfer.js';
import Payment from './models/Payment.js';
import SearchLog from './models/SearchLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idMap = new Map();
const getNewId = (oldId) => {
    if (!oldId) return null;
    if (!idMap.has(oldId)) {
        idMap.set(oldId, new mongoose.Types.ObjectId());
    }
    return idMap.get(oldId);
};

const mapIds = (obj) => {
    const newObj = { ...obj };
    if (newObj._id) {
        newObj._id = getNewId(newObj._id);
    }
    return newObj;
};

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Device.deleteMany();
        await Transfer.deleteMany();
        await Payment.deleteMany();
        await SearchLog.deleteMany();

        // Read db.json
        const dataPath = path.join(__dirname, 'db.json');
        const rawData = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        // 1. Users
        if (data.users && data.users.length > 0) {
            const usersToInsert = data.users.map(u => {
                const userObj = mapIds(u);
                if (userObj.parentVendor) userObj.parentVendor = getNewId(userObj.parentVendor);
                return userObj;
            });
            await User.insertMany(usersToInsert);
            console.log(`Imported ${usersToInsert.length} users`);
        }

        // 2. Devices
        if (data.devices && data.devices.length > 0) {
            const devicesToInsert = data.devices.map(d => {
                const devObj = mapIds(d);
                if (devObj.currentOwner) devObj.currentOwner = getNewId(devObj.currentOwner);
                if (devObj.history) {
                    devObj.history = devObj.history.map(h => ({
                        ...h,
                        previousOwner: h.previousOwner ? getNewId(h.previousOwner) : null,
                        newOwner: h.newOwner ? getNewId(h.newOwner) : null,
                        transferDate: h.transferDate ? new Date(h.transferDate) : Date.now()
                    }));
                }
                return devObj;
            });
            await Device.insertMany(devicesToInsert);
            console.log(`Imported ${devicesToInsert.length} devices`);
        }

        // 3. Transfers
        if (data.transfers && data.transfers.length > 0) {
            const transfersToInsert = data.transfers.map(t => {
                const trObj = mapIds(t);
                if (trObj.device) trObj.device = getNewId(trObj.device);
                if (trObj.initiator) trObj.initiator = getNewId(trObj.initiator);
                if (trObj.targetUser) trObj.targetUser = getNewId(trObj.targetUser);
                return trObj;
            });
            await Transfer.insertMany(transfersToInsert);
            console.log(`Imported ${transfersToInsert.length} transfers`);
        }

        // 4. Payments
        if (data.payments && data.payments.length > 0) {
            const paymentsToInsert = data.payments.map(p => {
                const pObj = mapIds(p);
                if (pObj.user) pObj.user = getNewId(pObj.user);
                return pObj;
            });
            await Payment.insertMany(paymentsToInsert);
            console.log(`Imported ${paymentsToInsert.length} payments`);
        }

        // 5. SearchLogs
        if (data.searchLogs && data.searchLogs.length > 0) {
            const logsToInsert = data.searchLogs.map(s => {
                const sObj = mapIds(s);
                if (sObj.user) sObj.user = getNewId(sObj.user);
                if (sObj.device) sObj.device = getNewId(sObj.device);
                return sObj;
            });
            await SearchLog.insertMany(logsToInsert);
            console.log(`Imported ${logsToInsert.length} search logs`);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with seed: ${error.message}`);
        process.exit(1);
    }
};

importData();
