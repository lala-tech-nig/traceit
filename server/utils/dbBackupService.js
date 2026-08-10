import cron from 'node-cron';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target root folder: "server/DB backup"
const BACKUP_BASE_DIR = path.join(__dirname, '..', 'DB backup');

/**
 * Performs a complete JSON backup of all collections in the MongoDB database.
 * @param {string} description Custom description for the backup instance.
 * @returns {Promise<object>} Summary of the backup process.
 */
export const performDatabaseBackup = async (description = 'Automated 12:00 AM Nigeria Time (WAT) MongoDB Database Snapshot') => {
    try {
        if (!mongoose.connection || mongoose.connection.readyState !== 1) {
            console.error('[DB BACKUP ERROR] Mongoose is not connected to MongoDB.');
            return null;
        }

        const now = new Date();
        
        // Format date/time string for folder name (e.g. backup_2026-07-30_00-00-00)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestampFolder = `backup_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
        const targetDir = path.join(BACKUP_BASE_DIR, timestampFolder);

        // Ensure "DB backup" base folder and timestamp folder exist
        if (!fs.existsSync(BACKUP_BASE_DIR)) {
            fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
        }
        fs.mkdirSync(targetDir, { recursive: true });

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionStats = {};

        for (const colInfo of collections) {
            const colName = colInfo.name;
            const collection = db.collection(colName);
            const docs = await collection.find({}).toArray();
            
            collectionStats[colName] = docs.length;

            const filePath = path.join(targetDir, `${colName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
        }

        // Format human-readable Nigeria Time (WAT)
        const nigeriaTimeString = now.toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const metadata = {
            backupName: timestampFolder,
            timestampISO: now.toISOString(),
            nigeriaLocalTime: `${nigeriaTimeString} (WAT)`,
            description: description,
            databaseName: db.databaseName,
            totalCollections: collections.length,
            collections: collectionStats
        };

        const metadataPath = path.join(targetDir, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

        console.log(`\n=============================================================`);
        console.log(`[DB BACKUP SUCCESS] MongoDB Snapshot Saved Successfully!`);
        console.log(` Location    : ${targetDir}`);
        console.log(` Nigeria Time: ${nigeriaTimeString} (WAT)`);
        console.log(` Collections : ${collections.length} collections saved`);
        console.log(` Description : ${description}`);
        console.log(`=============================================================\n`);

        return metadata;
    } catch (error) {
        console.error('[DB BACKUP ERROR] Failed to perform database backup:', error);
        return null;
    }
};

/**
 * Initializes the automated cron job to run every day at 12:00 AM Nigeria Time (WAT / Africa/Lagos).
 */
export const startBackupScheduler = () => {
    // Cron schedule: 0 0 * * * (At 00:00 / 12:00 AM every day)
    cron.schedule('0 0 * * *', async () => {
        console.log('[DB BACKUP] Triggering scheduled 12:00 AM Nigeria Time MongoDB backup...');
        await performDatabaseBackup('Scheduled 12:00 AM Nigeria Time Daily Database Backup');
    }, {
        timezone: 'Africa/Lagos'
    });

    console.log('📦 Automated Daily MongoDB Backup Scheduler initialized (Configured for 12:00 AM Nigeria Time - Africa/Lagos)');
};
