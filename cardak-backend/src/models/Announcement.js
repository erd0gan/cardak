const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium'
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sendPushNotification: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    targetAudience: {
        type: DataTypes.STRING,
        defaultValue: 'all'
    },
    targetBlocks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
            const value = this.getDataValue('targetBlocks');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('targetBlocks', JSON.stringify(value || []));
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Announcement;