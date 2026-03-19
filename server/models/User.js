import JsonDB from '../utils/jsonDb.js';
import bcrypt from 'bcryptjs';

const db = new JsonDB('users');

function attachMethods(user) {
    if (!user) return null;
    
    user.matchPassword = async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    };
    return user;
}

const User = {
    async create(data) {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        
        data.role = data.role || 'basic';
        data.image = data.image || null;
        data.ninVerified = data.ninVerified || false;
        data.isApproved = data.isApproved || false;
        data.hasPaid = data.hasPaid || false;
        data.transferCount = data.transferCount || 0;
        
        const user = await db.create(data);
        return attachMethods(user);
    },
    
    async find(query) {
        const users = await db.find(query);
        return users.map(u => attachMethods(u));
    },

    async findOne(query) {
        const user = await db.findOne(query);
        return attachMethods(user);
    },

    async findById(id) {
        const user = await db.findById(id);
        return attachMethods(user);
    },
    
    async findByIdAndUpdate(id, data, options) {
        const updated = await db.findByIdAndUpdate(id, data, options);
        return attachMethods(updated);
    },

    async updateMany(query, data) {
        return db.updateMany(query, data);
    }
};

export default User;
