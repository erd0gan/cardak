const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
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
    facilityType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    facilityName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reservationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'confirmed'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    numberOfGuests: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Reservation;