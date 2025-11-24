const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Visitor = require('../models/Visitor');
const User = require('../models/User');

// Get visitor by ID (for security QR verification)
router.get('/:id', async(req, res) => {
    try {
        const visitor = await Visitor.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'Resident',
                attributes: ['id', 'firstName', 'lastName', 'buildingBlock', 'apartmentNumber']
            }]
        });

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Ziyaretçi bulunamadı'
            });
        }

        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check-in visitor (security approval)
router.put('/:id/check-in', async(req, res) => {
    try {
        const visitor = await Visitor.findByPk(req.params.id);

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Ziyaretçi bulunamadı'
            });
        }

        visitor.checkInTime = new Date();
        visitor.status = 'checked-in';
        await visitor.save();

        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const { userId, visitorName, visitorPhone, expectedArrival, fullName, phone, idNumber, vehiclePlate, visitDate, visitTime, purpose } = req.body;

        // Use new fields if provided, fallback to old fields for backward compatibility
        const name = fullName || visitorName;
        const phoneNumber = phone || visitorPhone;
        const visitDateTime = visitDate || expectedArrival || new Date().toISOString();

        // Generate QR code with visitor ID
        const visitorId = uuidv4();
        const qrCodeData = JSON.stringify({ visitorId });
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Set valid time window: visitDate ± 2 hours
        const arrivalTime = new Date(visitDateTime);
        const validFrom = new Date(arrivalTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
        const validUntil = new Date(arrivalTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after

        const visitor = await Visitor.create({
            id: visitorId,
            userId,
            fullName: name,
            visitorName: name, // Keep for backward compatibility
            phone: phoneNumber,
            visitorPhone: phoneNumber, // Keep for backward compatibility
            idNumber,
            vehiclePlate,
            visitDate: visitDateTime,
            visitTime: visitTime || new Date(visitDateTime).toTimeString().slice(0, 5),
            purpose,
            qrCode: qrCodeData,
            validFrom,
            validUntil,
            status: 'approved'
        });

        res.status(201).json({
            success: true,
            data: {...visitor.toJSON(), qrCodeImage }
        });
    } catch (error) {
        console.error('Visitor creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async(req, res) => {
    try {
        const visitors = await Visitor.findAll();
        res.json({ success: true, data: visitors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const visitor = await Visitor.findByPk(id);

        if (!visitor) {
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        }

        await visitor.destroy();
        res.json({ success: true, message: 'Visitor deleted successfully' });
    } catch (error) {
        console.error('Visitor deletion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;