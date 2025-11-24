const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite for easy development (no PostgreSQL setup needed!)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false, // Disable SQL query logging
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test connection and auto-create tables
async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        await sequelize.sync(); // Auto-create tables (without alter to avoid FK issues)
        console.log('✅ Database tables synchronized.');
        return true;
    } catch (err) {
        console.error('❌ Unable to connect to the database:', err);
        return false;
    }
}

// Don't initialize immediately, let server.js control it

module.exports = sequelize;
module.exports.initDatabase = initDatabase;