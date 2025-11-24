const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    licensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerType: {
        type: DataTypes.ENUM('resident', 'guest', 'unauthorized'),
        defaultValue: 'resident'
    },
    blockNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    apartmentNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vehicleType: {
        type: DataTypes.ENUM('car', 'motorcycle', 'truck', 'van'),
        defaultValue: 'car'
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    model: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Plaka tanıma geçmişi için
    lastSeen: {
        type: DataTypes.DATE,
        allowNull: true
    },
    entryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'vehicles'
});

module.exports = Vehicle;