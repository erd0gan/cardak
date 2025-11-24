const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
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
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Chat session identifier'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sender: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'user or ai'
    },
    context: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Conversation context as JSON',
        get() {
            const value = this.getDataValue('context');
            return value ? JSON.parse(value) : {};
        },
        set(value) {
            this.setDataValue('context', JSON.stringify(value || {}));
        }
    },
    intent: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Detected user intent: payment_query, announcement_info, ticket_create, etc.'
    },
    sentiment: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'positive, neutral, negative'
    }
}, {
    timestamps: true
});

module.exports = ChatMessage;