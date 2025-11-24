const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleLog = sequelize.define('VehicleLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vehicles',
            key: 'id'
        }
    },
    licensePlate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    eventType: {
        type: DataTypes.ENUM('entry', 'exit'),
        defaultValue: 'entry'
    },
    recognitionStatus: {
        type: DataTypes.ENUM('recognized', 'guest', 'unauthorized', 'manual'),
        defaultValue: 'recognized'
    },
    confidence: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        comment: 'OCR confidence score (0-100)'
    },
    cameraId: {
        type: DataTypes.STRING,
        defaultValue: 'GATE-CAM-01'
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Captured plate image URL'
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: 'Ana Giriş'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'vehicle_logs'
});

module.exports = VehicleLog;