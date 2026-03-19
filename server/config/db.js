import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'db.json');

const connectDB = async () => {
    try {
        if (!fs.existsSync(dbPath)) {
            console.log('db.json not found. It will be created by JsonDB on startup.');
        } else {
            console.log('Local db.json ready');
        }
    } catch (error) {
        console.error(`Error with local DB: ${error.message}`);
    }
};

export default connectDB;
