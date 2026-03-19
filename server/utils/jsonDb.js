import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'db.json');

// Initialize db.json if it doesn't exist
const defaultData = {
    users: [],
    devices: [],
    transfers: [],
    payments: [],
    searchLogs: []
};

if (!fsSync.existsSync(dbPath)) {
    fsSync.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
}

class JsonDB {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }

    async _read() {
        try {
            const data = await fs.readFile(dbPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${dbPath}`, error);
            return defaultData; // Fallback
        }
    }

    async _write(data) {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    }

    async find(query = {}) {
        const db = await this._read();
        let collection = db[this.collectionName] || [];

        if (Object.keys(query).length > 0) {
            collection = collection.filter(item => {
                if (query.$or) {
                    return query.$or.some(q => Object.entries(q).every(([key, value]) => item[key] === value));
                }
                return Object.entries(query).every(([key, value]) => item[key] === value);
            });
        }
        
        // Return wrapped documents
        return collection.map(item => this._toDocument(item));
    }

    async findOne(query) {
        const results = await this.find(query);
        return results.length > 0 ? results[0] : null;
    }

    async findById(id) {
        const stringId = id ? id.toString() : '';
        return this.findOne({ _id: stringId });
    }

    async create(data) {
        const db = await this._read();
        if (!db[this.collectionName]) db[this.collectionName] = [];
        
        const newItem = {
            _id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data
        };
        
        db[this.collectionName].push(newItem);
        await this._write(db);
        return this._toDocument(newItem);
    }
    
    async findByIdAndUpdate(id, data, options = { new: true }) {
        const stringId = id ? id.toString() : '';
        const db = await this._read();
        const index = db[this.collectionName].findIndex(i => i._id === stringId);
        
        if (index !== -1) {
            db[this.collectionName][index] = { 
                ...db[this.collectionName][index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            await this._write(db);
            return options.new ? this._toDocument(db[this.collectionName][index]) : null;
        }
        return null;
    }

    async updateMany(query, data) {
        const db = await this._read();
        let collection = db[this.collectionName] || [];
        let modifiedCount = 0;

        collection = collection.map(item => {
            const matchesQuery = Object.keys(query).length === 0 || Object.entries(query).every(([key, value]) => item[key] === value);
            if (matchesQuery) {
                modifiedCount++;
                return { ...item, ...data, updatedAt: new Date().toISOString() };
            }
            return item;
        });

        db[this.collectionName] = collection;
        await this._write(db);
        return { nModified: modifiedCount };
    }

    _toDocument(item) {
        const doc = { ...item };
        doc.save = async () => {
            const db = await this._read();
            const index = db[this.collectionName].findIndex(i => i._id === doc._id);
            if (index !== -1) {
                doc.updatedAt = new Date().toISOString();
                // Clean up the save method before saving to JSON so it doesn't try to serialize it
                const docToSave = { ...doc };
                delete docToSave.save;
                db[this.collectionName][index] = docToSave;
                await this._write(db);
                return this._toDocument(docToSave);
            }
            return null;
        };
        return doc;
    }
}

// Ensure the db exists on first import
if (!fsSync.existsSync(dbPath)) {
    fsSync.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
}

export default JsonDB;
