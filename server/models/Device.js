import JsonDB from '../utils/jsonDb.js';

const db = new JsonDB('devices');

const Device = {
    async create(data) {
        data.history = data.history || [];
        data.status = data.status || 'clean';
        return db.create(data);
    },
    
    async find(query) {
        const results = await db.find(query);
        // Add fake populate support because controllers chain `.populate()`
        results.populate = function() { return this; };
        return results;
    },

    async findOne(query) {
        const result = await db.findOne(query);
        return result;
    },

    async findById(id) {
        const result = await db.findById(id);
        return result;
    },
    
    async findByIdAndUpdate(id, data, options) {
        const result = await db.findByIdAndUpdate(id, data, options);
        return result;
    },

    async updateMany(query, data) {
        return db.updateMany(query, data);
    }
};

export default Device;
