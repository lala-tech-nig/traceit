import JsonDB from '../utils/jsonDb.js';

const db = new JsonDB('payments');

const Payment = {
    async create(data) {
        data.status = data.status || 'pending';
        return db.create(data);
    },
    
    async find(query) {
        const results = await db.find(query);
        results.populate = function() { return this; };
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

export default Payment;
