const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarketplaceItem = sequelize.define('MarketplaceItem', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Price if selling, null if borrowing or giving away'
    },
    imageUrls: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
            const value = this.getDataValue('imageUrls');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('imageUrls', JSON.stringify(value || []));
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    },
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
            const value = this.getDataValue('tags');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('tags', JSON.stringify(value || []));
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = MarketplaceItem;