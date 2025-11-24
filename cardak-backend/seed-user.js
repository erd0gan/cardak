const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function seedUsers() {
    try {
        await sequelize.authenticate();
        console.log('📦 Database connected');

        // Hash password once for all users
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Admin user
        const adminExists = await User.findOne({ where: { email: 'admin@admin.com' } });
        if (!adminExists) {
            await User.create({
                email: 'admin@admin.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phone: '5551234567',
                role: 'admin',
                buildingBlock: 'A',
                apartmentNumber: '1',
                isOwner: true,
                isActive: true
            });
            console.log('✅ Admin user created (admin@admin.com / admin123)');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Manager user
        const managerExists = await User.findOne({ where: { email: 'manager@manager.com' } });
        if (!managerExists) {
            await User.create({
                email: 'manager@manager.com',
                password: hashedPassword,
                firstName: 'Manager',
                lastName: 'User',
                phone: '5557654321',
                role: 'manager',
                buildingBlock: 'B',
                apartmentNumber: '5',
                isOwner: true,
                isActive: true
            });
            console.log('✅ Manager user created (manager@manager.com / admin123)');
        } else {
            console.log('ℹ️  Manager user already exists');
        }

        // Test resident user
        const residentExists = await User.findOne({ where: { email: 'test@test.com' } });
        if (!residentExists) {
            await User.create({
                email: 'test@test.com',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                phone: '5555555555',
                role: 'resident',
                buildingBlock: 'A',
                apartmentNumber: '10',
                isOwner: true,
                isActive: true
            });
            console.log('✅ Resident user created (test@test.com / admin123)');
        } else {
            console.log('ℹ️  Resident user already exists');
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin:    admin@admin.com / admin123');
        console.log('   Manager:  manager@manager.com / admin123');
        console.log('   Resident: test@test.com / admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedUsers();