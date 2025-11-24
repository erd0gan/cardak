const express = require('express');
const router = express.Router();
const { Vehicle, VehicleLog } = require('../models');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// GET /api/v1/vehicles - Tüm araçları listele
router.get('/', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { ownerType, isActive, search } = req.query;

        const where = {};
        if (ownerType) where.ownerType = ownerType;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where[Op.or] = [
                { licensePlate: {
                        [Op.like]: `%${search}%` } },
                { ownerName: {
                        [Op.like]: `%${search}%` } },
                { blockNumber: {
                        [Op.like]: `%${search}%` } }
            ];
        }

        const vehicles = await Vehicle.findAll({
            where,
            order: [
                ['lastSeen', 'DESC'],
                ['createdAt', 'DESC']
            ],
            include: [{
                model: VehicleLog,
                limit: 1,
                order: [
                    ['createdAt', 'DESC']
                ]
            }]
        });

        res.json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Araçlar yüklenemedi',
            error: error.message
        });
    }
});

// GET /api/v1/vehicles/:id - Tek araç detayı
router.get('/:id', authenticateToken, isAdmin, async(req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id, {
            include: [{
                model: VehicleLog,
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 20
            }]
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Araç bulunamadı'
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Araç detayı yüklenemedi',
            error: error.message
        });
    }
});

// POST /api/v1/vehicles - Yeni araç ekle
router.post('/', authenticateToken, isAdmin, async(req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Araç başarıyla eklendi',
            data: vehicle
        });
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Araç eklenemedi',
            error: error.message
        });
    }
});

// PUT /api/v1/vehicles/:id - Araç güncelle
router.put('/:id', authenticateToken, isAdmin, async(req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Araç bulunamadı'
            });
        }

        await vehicle.update(req.body);

        res.json({
            success: true,
            message: 'Araç güncellendi',
            data: vehicle
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Araç güncellenemedi',
            error: error.message
        });
    }
});

// DELETE /api/v1/vehicles/:id - Araç sil
router.delete('/:id', authenticateToken, isAdmin, async(req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Araç bulunamadı'
            });
        }

        await vehicle.destroy();

        res.json({
            success: true,
            message: 'Araç silindi'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Araç silinemedi',
            error: error.message
        });
    }
});

// GET /api/v1/vehicles/stats/overview - İstatistikler
router.get('/stats/overview', authenticateToken, isAdmin, async(req, res) => {
    try {
        const [totalVehicles, residentCount, guestCount, unauthorizedCount, todayEntries] = await Promise.all([
            Vehicle.count({ where: { isActive: true } }),
            Vehicle.count({ where: { ownerType: 'resident', isActive: true } }),
            Vehicle.count({ where: { ownerType: 'guest', isActive: true } }),
            Vehicle.count({ where: { ownerType: 'unauthorized', isActive: true } }),
            VehicleLog.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        const parkingCapacity = 200; // Toplam otopark kapasitesi
        const occupancyRate = Math.min((totalVehicles / parkingCapacity) * 100, 100);

        res.json({
            success: true,
            data: {
                totalVehicles,
                residentCount,
                guestCount,
                unauthorizedCount,
                todayEntries,
                parkingCapacity,
                availableSpaces: Math.max(parkingCapacity - totalVehicles, 0),
                occupancyRate: occupancyRate.toFixed(1)
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler yüklenemedi',
            error: error.message
        });
    }
});

module.exports = router;