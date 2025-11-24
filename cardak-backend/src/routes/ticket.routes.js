const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication to all ticket routes
router.use(authenticateToken);

router.get('/', async(req, res) => {
    try {
        const { role, staffType } = req.user;
        let whereClause = {};

        // Staff sadece kendine atanan talepleri görsün
        if (role === 'staff') {
            whereClause.assignedTo = req.user.id;
        }

        const tickets = await Ticket.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'Creator',
                attributes: ['id', 'firstName', 'lastName', 'apartmentNumber', 'phone']
            }, {
                model: User,
                as: 'AssignedStaff',
                attributes: ['id', 'firstName', 'lastName', 'staffType']
            }],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get staff members for assignment
router.get('/staff', async(req, res) => {
    try {
        const staff = await User.findAll({
            where: { role: 'staff', isActive: true },
            attributes: ['id', 'firstName', 'lastName', 'staffType', 'phone']
        });
        res.json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign ticket to staff
router.put('/:id/assign', async(req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        // Check if user is admin or manager
        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.assignedTo = assignedTo;
        ticket.status = 'in-progress';
        await ticket.save();

        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update ticket status (for staff)
router.put('/:id/status', async(req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Staff can only update tickets assigned to them
        if (req.user.role === 'staff' && ticket.assignedTo !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        ticket.status = status;
        if (feedback) ticket.feedback = feedback;
        if (status === 'closed') ticket.resolvedAt = new Date();
        await ticket.save();

        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        // Add userId from authenticated user token
        const ticketData = {
            ...req.body,
            userId: req.user.id || req.user.userId // Token'da 'id' olarak geliyor
        };

        // Ensure imageUrls is properly formatted as array
        if (!ticketData.imageUrls) {
            ticketData.imageUrls = [];
        } else if (typeof ticketData.imageUrls === 'string') {
            try {
                ticketData.imageUrls = JSON.parse(ticketData.imageUrls);
            } catch (e) {
                ticketData.imageUrls = [];
            }
        }

        console.log('Creating ticket with data:', ticketData);
        const ticket = await Ticket.create(ticketData);
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        console.error('Ticket creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;