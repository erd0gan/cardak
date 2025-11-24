const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');

router.get('/', async(req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'buildingBlock', 'apartmentNumber']
            }],
            order: [
                ['dueDate', 'DESC']
            ]
        });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.findAll({
            where: { userId },
            order: [
                ['dueDate', 'DESC']
            ]
        });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Aidat ödeme endpoint'i
router.post('/:paymentId/pay', async(req, res) => {
    try {
        const { paymentId } = req.params;
        const { paymentMethod, transactionId } = req.body;

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Ödeme bulunamadı'
            });
        }

        if (payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Bu ödeme zaten yapılmış'
            });
        }

        // Ödeme işlemini gerçekleştir
        payment.status = 'paid';
        payment.paidAt = new Date();
        payment.paymentMethod = paymentMethod || 'online';
        payment.transactionId = transactionId || `TXN-${Date.now()}`;

        await payment.save();

        res.json({
            success: true,
            message: 'Ödeme başarıyla tamamlandı',
            data: payment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;