const express = require('express');
const router = express.Router();
const { VehicleLog, Vehicle } = require('../models');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// GET /api/v1/vehicle-logs - Tüm logları listele
router.get('/', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { startDate, endDate, eventType, recognitionStatus, limit = 50 } = req.query;

        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }
        if (eventType) where.eventType = eventType;
        if (recognitionStatus) where.recognitionStatus = recognitionStatus;

        const logs = await VehicleLog.findAll({
            where,
            include: [{
                model: Vehicle,
                required: false
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Get vehicle logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Loglar yüklenemedi',
            error: error.message
        });
    }
});

// POST /api/v1/vehicle-logs - Yeni log ekle (plaka tanıma simülasyonu)
router.post('/', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { licensePlate, eventType = 'entry', cameraId, location, notes } = req.body;

        if (!licensePlate) {
            return res.status(400).json({
                success: false,
                message: 'Plaka bilgisi gerekli'
            });
        }

        // Plakayı sistemde ara
        const vehicle = await Vehicle.findOne({
            where: { licensePlate: licensePlate.toUpperCase() }
        });

        let recognitionStatus = 'unauthorized';
        let confidence = Math.random() * 15 + 85; // 85-100 arası confidence

        if (vehicle) {
            recognitionStatus = vehicle.ownerType === 'resident' ? 'recognized' : 'guest';

            // Araç bilgilerini güncelle
            await vehicle.update({
                lastSeen: new Date(),
                entryCount: vehicle.entryCount + 1
            });
        } else {
            confidence = Math.random() * 20 + 70; // 70-90 arası (daha düşük)
        }

        // Log oluştur
        const log = await VehicleLog.create({
            vehicleId: vehicle ? vehicle.id : null,
            licensePlate: licensePlate.toUpperCase(),
            eventType,
            recognitionStatus,
            confidence,
            cameraId: cameraId || 'GATE-CAM-01',
            location: location || 'Ana Giriş',
            notes
        });

        const logWithVehicle = await VehicleLog.findByPk(log.id, {
            include: [{ model: Vehicle, required: false }]
        });

        res.status(201).json({
            success: true,
            message: 'Plaka tanıma kaydı oluşturuldu',
            data: logWithVehicle
        });
    } catch (error) {
        console.error('Create vehicle log error:', error);
        res.status(500).json({
            success: false,
            message: 'Log oluşturulamadı',
            error: error.message
        });
    }
});

// GET /api/v1/vehicle-logs/recent - Son tanımalar
router.get('/recent', authenticateToken, isAdmin, async(req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const logs = await VehicleLog.findAll({
            include: [{
                model: Vehicle,
                required: false
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            limit
        });

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Get recent logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Son loglar yüklenemedi',
            error: error.message
        });
    }
});

// GET /api/v1/vehicle-logs/stats/daily - Günlük istatistikler
router.get('/stats/daily', authenticateToken, isAdmin, async(req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalToday, entries, exits, recognized, guests, unauthorized] = await Promise.all([
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    eventType: 'entry'
                }
            }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    eventType: 'exit'
                }
            }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    recognitionStatus: 'recognized'
                }
            }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    recognitionStatus: 'guest'
                }
            }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    recognitionStatus: 'unauthorized'
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalToday,
                entries,
                exits,
                recognized,
                guests,
                unauthorized,
                recognitionRate: totalToday > 0 ? ((recognized / totalToday) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Günlük istatistikler yüklenemedi',
            error: error.message
        });
    }
});

module.exports = router;