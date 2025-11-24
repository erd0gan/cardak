const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define('Visitor', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'User who created the visitor pass'
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    visitorName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Deprecated, use fullName'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    visitorPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Deprecated, use phone'
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'TC Kimlik No'
    },
    vehiclePlate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Vehicle plate number'
    },
    visitDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    visitTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Purpose of visit'
    },
    qrCode: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
        comment: 'Unique QR code for visitor entry'
    },
    validFrom: {
        type: DataTypes.DATE,
        allowNull: true
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'approved'
    },
    checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When visitor checked in'
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    checkedInBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Security personnel who checked in the visitor'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Visitor;