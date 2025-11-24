const express = require('express');
const router = express.Router();
const aiAnalyticsService = require('../services/ai-analytics.service');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Gelecek ay gider tahmini
router.get('/predict-expenses', authenticateToken, isAdmin, async(req, res) => {
    try {
        const prediction = await aiAnalyticsService.predictNextMonthExpenses();
        res.json({ success: true, data: prediction });
    } catch (error) {
        console.error('Predict expenses error:', error);
        res.status(500).json({ success: false, message: 'Tahmin oluşturulamadı', error: error.message });
    }
});

// Bütçe optimizasyonu önerileri
router.get('/budget-optimization', authenticateToken, isAdmin, async(req, res) => {
    try {
        const suggestions = await aiAnalyticsService.getBudgetOptimizationSuggestions();
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Budget optimization error:', error);
        res.status(500).json({ success: false, message: 'Optimizasyon önerileri oluşturulamadı', error: error.message });
    }
});

// Harcama anomalisi tespiti
router.get('/anomalies', authenticateToken, isAdmin, async(req, res) => {
    try {
        const anomalies = await aiAnalyticsService.detectSpendingAnomalies();
        res.json({ success: true, data: anomalies });
    } catch (error) {
        console.error('Anomaly detection error:', error);
        res.status(500).json({ success: false, message: 'Anomali tespiti başarısız', error: error.message });
    }
});

// Trend analizi
router.get('/trends', authenticateToken, isAdmin, async(req, res) => {
    try {
        const trends = await aiAnalyticsService.generateTrendAnalysis();
        res.json({ success: true, data: trends });
    } catch (error) {
        console.error('Trend analysis error:', error);
        res.status(500).json({ success: false, message: 'Trend analizi oluşturulamadı', error: error.message });
    }
});

// Gelişmiş raporlama
router.post('/advanced-report', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const report = await aiAnalyticsService.generateAdvancedReport(
            new Date(startDate),
            new Date(endDate)
        );

        res.json(report);
    } catch (error) {
        console.error('Advanced report error:', error);
        res.status(500).json({ error: 'Failed to generate advanced report' });
    }
});

// Özet dashboard verisi
router.get('/dashboard-summary', authenticateToken, isAdmin, async(req, res) => {
    try {
        const [prediction, budgetOptimization, anomalies, trends] = await Promise.all([
            aiAnalyticsService.predictNextMonthExpenses(),
            aiAnalyticsService.getBudgetOptimizationSuggestions(),
            aiAnalyticsService.detectSpendingAnomalies(),
            aiAnalyticsService.generateTrendAnalysis()
        ]);

        // AI önerileri al
        const aiInsights = await aiAnalyticsService.getAIInsights({
            prediction: prediction.prediction,
            average: prediction.average,
            trend: prediction.trend,
            budgetSuggestions: budgetOptimization.suggestions,
            anomalies: anomalies.anomalies
        });

        res.json({
            success: true,
            data: {
                prediction,
                budgetOptimization,
                anomalies,
                trends,
                aiInsights
            }
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard özeti oluşturulamadı',
            error: error.message
        });
    }
});

module.exports = router;