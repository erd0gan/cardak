const express = require('express');
const router = express.Router();
const MarketplaceItem = require('../models/MarketplaceItem');

router.get('/', async(req, res) => {
    try {
        const items = await MarketplaceItem.findAll({
            where: { isActive: true },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const item = await MarketplaceItem.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;