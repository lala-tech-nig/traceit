import JsonDB from '../utils/jsonDb.js';

const db = new JsonDB('searchLogs');

const SearchLog = {
    async create(data) {
        data.found = data.found === undefined ? false : data.found;
        return db.create(data);
    },
    
    async find(query) {
        const results = await db.find(query);
        results.populate = function() { return this; }; // mock populate
        // Add fake sort support because controllers might use it
        results.sort = function() { return this; };
        return results;
    },

    async findOne(query) {
        return db.findOne(query);
    },

    async findById(id) {
        return db.findById(id);
    },
    
    async findByIdAndUpdate(id, data, options) {
        return db.findByIdAndUpdate(id, data, options);
    },

    async updateMany(query, data) {
        return db.updateMany(query, data);
    }
};

export default SearchLog;
