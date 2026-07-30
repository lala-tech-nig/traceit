import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_BASE_DIR = path.join(__dirname, 'DB backup');

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env file');
    process.exit(1);
}

const targetFolderName = process.argv[2];

async function restoreDatabase() {
    try {
        if (!fs.existsSync(BACKUP_BASE_DIR)) {
            console.error(`❌ Backup directory "${BACKUP_BASE_DIR}" does not exist.`);
            process.exit(1);
        }

        let folderToRestore = targetFolderName;

        if (!folderToRestore) {
            // Find latest backup folder
            const subfolders = fs.readdirSync(BACKUP_BASE_DIR)
                .filter(name => name.startsWith('backup_'))
                .sort()
                .reverse();

            if (subfolders.length === 0) {
                console.error('❌ No backup folders starting with "backup_" found in DB backup.');
                process.exit(1);
            }
            folderToRestore = subfolders[0];
            console.log(`ℹ️ No backup specified. Using latest backup: "${folderToRestore}"`);
        }

        const backupPath = path.join(BACKUP_BASE_DIR, folderToRestore);
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Specified backup path "${backupPath}" does not exist.`);
            process.exit(1);
        }

        console.log(`\nConnecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        console.log(`Connected to Database: "${db.databaseName}"`);
        console.log(`Restoring snapshot from: ${backupPath}\n`);

        const files = fs.readdirSync(backupPath).filter(f => f.endsWith('.json') && f !== 'metadata.json');

        for (const file of files) {
            const collectionName = path.basename(file, '.json');
            const filePath = path.join(backupPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const documents = JSON.parse(content);

            const collection = db.collection(collectionName);
            
            // Clear existing collection records
            await collection.deleteMany({});
            
            if (documents.length > 0) {
                // Convert string _ids to ObjectIds if applicable
                const parsedDocs = documents.map(doc => {
                    if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
                        try { doc._id = new mongoose.Types.ObjectId(doc._id); } catch (e) {}
                    }
                    return doc;
                });

                await collection.insertMany(parsedDocs);
                console.log(` ✅ Restored collection "${collectionName}": ${parsedDocs.length} records`);
            } else {
                console.log(` ⚠️ Collection "${collectionName}" was empty in backup.`);
            }
        }

        console.log(`\n=============================================================`);
        console.log(`🎉 RESTORE COMPLETED SUCCESSFULLY!`);
        console.log(` Backup Source: ${folderToRestore}`);
        console.log(` Target DB    : ${db.databaseName}`);
        console.log(`=============================================================\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Database restore failed:', error);
        process.exit(1);
    }
}

restoreDatabase();
