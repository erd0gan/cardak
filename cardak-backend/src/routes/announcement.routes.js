const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

router.get('/', async(req, res) => {
    try {
        const announcements = await Announcement.findAll({
            where: { isActive: true },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const announcement = await Announcement.create(req.body);
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;