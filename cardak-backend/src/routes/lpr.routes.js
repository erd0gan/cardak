const express = require('express');
const router = express.Router();
const lprService = require('../services/lpr.service');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/v1/lpr/simulate - Tek plaka tanıma simülasyonu
router.post('/simulate', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { licensePlate, eventType = 'entry' } = req.body;

        const result = await lprService.simulateRecognition(licensePlate, eventType);

        res.json(result);
    } catch (error) {
        console.error('LPR Simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Plaka tanıma simülasyonu başarısız',
            error: error.message
        });
    }
});

// POST /api/v1/lpr/simulate-batch - Toplu simülasyon
router.post('/simulate-batch', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { count = 10 } = req.body;

        const results = await lprService.simulateMultipleRecognitions(Math.min(count, 50));

        res.json({
            success: true,
            message: `${results.length} araç simülasyonu tamamlandı`,
            data: results
        });
    } catch (error) {
        console.error('Batch LPR Simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Toplu simülasyon başarısız',
            error: error.message
        });
    }
});

// GET /api/v1/lpr/parking-analysis - Otopark doluluk analizi
router.get('/parking-analysis', authenticateToken, isAdmin, async(req, res) => {
    try {
        const analysis = await lprService.getParkingAnalysis();

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Parking Analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Otopark analizi başarısız',
            error: error.message
        });
    }
});

module.exports = router;