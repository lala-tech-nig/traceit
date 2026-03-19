import User from './models/User.js';

const seedAdmin = async () => {
    try {
        console.log('Seeding admin...');
        const existing = await User.findOne({ email: 'tech@traceit.com.ng' });
        if (existing) {
            console.log('Admin already exists!');
            process.exit(0);
        }
        
        await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'tech@traceit.com.ng',
            password: 'Lalatech2021.',
            phoneNumber: '00000000000',
            role: 'admin',
            isApproved: true,
            ninVerified: true,
            hasPaid: true
        });
        
        console.log('Admin seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
