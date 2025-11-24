const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Poll = sequelize.define('Poll', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'JSON string of array: [{id, text, votes: 0}]',
        get() {
            const value = this.getDataValue('options');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('options', JSON.stringify(value || []));
        }
    },
    allowMultipleVotes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft'
    },
    targetAudience: {
        type: DataTypes.STRING,
        defaultValue: 'all'
    }
}, {
    timestamps: true
});

const PollVote = sequelize.define('PollVote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    pollId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Polls',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    selectedOptions: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'JSON string of array: [optionId1, optionId2]',
        get() {
            const value = this.getDataValue('selectedOptions');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('selectedOptions', JSON.stringify(value || []));
        }
    }
}, {
    timestamps: true
});

module.exports = { Poll, PollVote };