const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const User = require('../models/User');

router.get('/', async(req, res) => {
    try {
        const reservations = await Reservation.findAll({
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'apartmentNumber']
            }],
            order: [
                ['reservationDate', 'DESC'],
                ['startTime', 'ASC']
            ]
        });
        res.json({ success: true, data: reservations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        // Check if user exists
        const userExists = await User.findByPk(req.body.userId);
        if (!userExists) {
            console.error('User not found:', req.body.userId);
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const reservation = await Reservation.create(req.body);
        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        console.error('Reservation creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;