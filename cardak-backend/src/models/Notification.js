const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
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
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'general',
        comment: 'general, payment, announcement, ticket, visitor, parcel'
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium',
        comment: 'low, medium, high, critical'
    },
    data: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string for additional data',
        get() {
            const value = this.getDataValue('data');
            return value ? JSON.parse(value) : {};
        },
        set(value) {
            this.setDataValue('data', JSON.stringify(value || {}));
        }
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    scheduledFor: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Schedule notification for future delivery'
    }
}, {
    timestamps: true
});

module.exports = Notification;