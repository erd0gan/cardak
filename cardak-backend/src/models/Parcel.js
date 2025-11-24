const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parcel = sequelize.define('Parcel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    courierCompany: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Cargo company name'
    },
    carrier: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Cargo company name (deprecated, use courierCompany)'
    },
    verificationCode: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: '4 digit code for security verification'
    },
    receivedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Security personnel who received the parcel'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'received'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Photo of the parcel'
    },
    receivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    collectedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    collectedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Person who collected the parcel'
    },
    securityApprovedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When security approved courier entry'
    }
}, {
    timestamps: true
});

module.exports = Parcel;