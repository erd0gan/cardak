const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

router.get('/stats', async(req, res) => {
    try {
        const totalUsers = await User.count();
        const pendingPayments = await Payment.count({ where: { status: 'pending' } });
        const openTickets = await Ticket.count({ where: { status: 'pending' } });

        res.json({
            success: true,
            data: {
                totalUsers,
                pendingPayments,
                openTickets
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;