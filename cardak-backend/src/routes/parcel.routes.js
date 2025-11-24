const express = require('express');
const router = express.Router();
const Parcel = require('../models/Parcel');
const User = require('../models/User');

// Verify parcel code (for security)
router.post('/verify-code', async(req, res) => {
    try {
        const { verificationCode } = req.body;

        if (!verificationCode || verificationCode.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir 4 haneli kod girin'
            });
        }

        const parcel = await Parcel.findOne({
            where: { verificationCode },
            include: [{
                model: User,
                as: 'Resident',
                attributes: ['id', 'firstName', 'lastName', 'buildingBlock', 'apartmentNumber']
            }]
        });

        if (!parcel) {
            return res.status(404).json({
                success: false,
                message: 'Geçersiz kod'
            });
        }

        res.json({ success: true, data: parcel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Approve security entry for courier
router.put('/:id/security-approve', async(req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id);
        if (!parcel) {
            return res.status(404).json({ success: false, message: 'Kargo bulunamadı' });
        }

        parcel.securityApprovedAt = new Date();
        parcel.status = 'in-site';
        await parcel.save();

        res.json({ success: true, data: parcel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all parcels
router.get('/', async(req, res) => {
    try {
        const parcels = await Parcel.findAll({
            order: [
                ['receivedAt', 'DESC']
            ]
        });
        res.json({ success: true, data: parcels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new parcel
router.post('/', async(req, res) => {
    try {
        // Generate 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

        const parcelData = {
            ...req.body,
            verificationCode,
            status: 'received'
        };

        const parcel = await Parcel.create(parcelData);

        // Include user info in response
        const parcelWithUser = await Parcel.findByPk(parcel.id, {
            include: [{
                model: User,
                as: 'Resident',
                attributes: ['id', 'firstName', 'lastName', 'buildingBlock', 'apartmentNumber']
            }]
        });

        res.status(201).json({ success: true, data: parcelWithUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark parcel as collected
router.put('/:id/collect', async(req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id);
        if (!parcel) {
            return res.status(404).json({ success: false, message: 'Parcel not found' });
        }

        parcel.status = 'collected';
        parcel.collectedAt = new Date();
        await parcel.save();

        res.json({ success: true, data: parcel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete parcel
router.delete('/:id', async(req, res) => {
    try {
        const parcel = await Parcel.findByPk(req.params.id);
        if (!parcel) {
            return res.status(404).json({ success: false, message: 'Parcel not found' });
        }

        await parcel.destroy();
        res.json({ success: true, message: 'Parcel deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;