const Payment = require('../models/Payment');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { Op } = require('sequelize');
const geminiService = require('./gemini.service');

class AIAnalyticsService {
    // Finansal tahminleme - Gelecek ay gider tahmini
    async predictNextMonthExpenses() {
        try {
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

            // Son 6 ayın ödeme verilerini al
            const payments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: sixMonthsAgo
                    }
                },
                attributes: ['amount', 'createdAt', 'type']
            });

            // Aylık ortalama hesapla
            const monthlyTotals = {};
            payments.forEach(payment => {
                const monthKey = `${payment.createdAt.getFullYear()}-${payment.createdAt.getMonth()}`;
                if (!monthlyTotals[monthKey]) {
                    monthlyTotals[monthKey] = 0;
                }
                monthlyTotals[monthKey] += parseFloat(payment.amount);
            });

            const months = Object.keys(monthlyTotals);
            const totals = Object.values(monthlyTotals);
            const average = totals.reduce((a, b) => a + b, 0) / totals.length;

            // Trend hesapla (son 3 ay vs önceki 3 ay)
            const recentAverage = totals.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const olderAverage = totals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            const trendPercentage = ((recentAverage - olderAverage) / olderAverage) * 100;

            // Tahmini hesapla (ortalama + trend)
            const prediction = average + (average * (trendPercentage / 100));

            return {
                prediction: Math.round(prediction),
                average: Math.round(average),
                trend: trendPercentage.toFixed(2),
                confidence: this._calculateConfidence(totals),
                monthlyData: months.map((month, i) => ({
                    month,
                    total: Math.round(totals[i])
                }))
            };
        } catch (error) {
            console.error('Predict expenses error:', error);
            throw error;
        }
    }

    // Bütçe optimizasyonu önerileri
    async getBudgetOptimizationSuggestions() {
        try {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

            // Son ay ödemeleri
            const lastMonthPayments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: lastMonth,
                        [Op.lt]: now
                    }
                }
            });

            // Önceki ay ödemeleri
            const previousMonthPayments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: twoMonthsAgo,
                        [Op.lt]: lastMonth
                    }
                }
            });

            const suggestions = [];

            // Tip bazlı analiz
            const lastMonthByType = this._groupByType(lastMonthPayments);
            const previousMonthByType = this._groupByType(previousMonthPayments);

            for (const type in lastMonthByType) {
                const current = lastMonthByType[type];
                const previous = previousMonthByType[type] || 0;
                const increase = ((current - previous) / previous) * 100;

                if (increase > 20) {
                    suggestions.push({
                        type: 'warning',
                        category: type,
                        message: `${type} kategorisinde %${increase.toFixed(1)} artış tespit edildi. Detaylı inceleme önerilir.`,
                        currentAmount: Math.round(current),
                        previousAmount: Math.round(previous),
                        potentialSaving: Math.round(current - previous),
                        priority: 'high'
                    });
                } else if (increase < -10) {
                    suggestions.push({
                        type: 'success',
                        category: type,
                        message: `${type} kategorisinde %${Math.abs(increase).toFixed(1)} tasarruf sağlandı.`,
                        currentAmount: Math.round(current),
                        previousAmount: Math.round(previous),
                        potentialSaving: Math.round(previous - current),
                        priority: 'low'
                    });
                }
            }

            // Genel öneriler
            const totalCurrent = Object.values(lastMonthByType).reduce((a, b) => a + b, 0);
            const totalPrevious = Object.values(previousMonthByType).reduce((a, b) => a + b, 0);

            if (totalCurrent > totalPrevious * 1.15) {
                suggestions.push({
                    type: 'warning',
                    category: 'genel',
                    message: 'Genel harcamalarda önemli artış var. Bütçe revizyonu önerilir.',
                    currentAmount: Math.round(totalCurrent),
                    previousAmount: Math.round(totalPrevious),
                    potentialSaving: Math.round(totalCurrent - totalPrevious),
                    priority: 'critical'
                });
            }

            return { suggestions };
        } catch (error) {
            console.error('Budget optimization error:', error);
            throw error;
        }
    }

    // Harcama anomalisi tespiti
    async detectSpendingAnomalies() {
        try {
            const now = new Date();
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

            const payments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: threeMonthsAgo
                    }
                },
                include: [{ model: User, attributes: ['firstName', 'lastName', 'buildingBlock', 'apartmentNumber'] }]
            });

            // Günlük bazda anomali tespiti
            const dailyTotals = {};
            payments.forEach(payment => {
                const dateKey = payment.createdAt.toISOString().split('T')[0];
                if (!dailyTotals[dateKey]) {
                    dailyTotals[dateKey] = [];
                }
                dailyTotals[dateKey].push(parseFloat(payment.amount));
            });

            // Her gün için toplam ve standart sapma hesapla
            const dailySums = Object.keys(dailyTotals).map(date => ({
                date,
                total: dailyTotals[date].reduce((a, b) => a + b, 0)
            }));

            const average = dailySums.reduce((a, b) => a + b.total, 0) / dailySums.length;
            const variance = dailySums.reduce((a, b) => a + Math.pow(b.total - average, 2), 0) / dailySums.length;
            const stdDev = Math.sqrt(variance);

            // Anomali: ortalamadan 2 standart sapma uzakta olan günler
            const anomalies = dailySums
                .filter(day => Math.abs(day.total - average) > 2 * stdDev)
                .map(day => ({
                    date: day.date,
                    amount: Math.round(day.total),
                    deviation: ((day.total - average) / average * 100).toFixed(2),
                    severity: Math.abs(day.total - average) > 3 * stdDev ? 'critical' : 'warning',
                    type: day.total > average ? 'spike' : 'drop'
                }));

            return {
                anomalies,
                statistics: {
                    average: Math.round(average),
                    standardDeviation: Math.round(stdDev),
                    threshold: Math.round(average + 2 * stdDev)
                }
            };
        } catch (error) {
            console.error('Anomaly detection error:', error);
            throw error;
        }
    }

    // Trend analizi ve raporlama
    async generateTrendAnalysis() {
        try {
            const now = new Date();
            const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

            // Ödeme trendleri
            const payments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: twelveMonthsAgo
                    }
                }
            });

            // Talep trendleri
            const tickets = await Ticket.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: twelveMonthsAgo
                    }
                }
            });

            // Aylık gruplama
            const monthlyPayments = this._groupByMonth(payments);
            const monthlyTickets = this._groupByMonth(tickets);

            // Trend hesaplama
            const paymentTrend = this._calculateTrend(Object.values(monthlyPayments));
            const ticketTrend = this._calculateTrend(Object.values(monthlyTickets));

            // Kategori bazlı trendler
            const categoryTrends = this._analyzeCategoryTrends(payments);

            return {
                overview: {
                    paymentTrend: {
                        direction: paymentTrend > 0 ? 'increasing' : 'decreasing',
                        percentage: Math.abs(paymentTrend).toFixed(2),
                        description: paymentTrend > 0 ?
                            'Ödemeler artış trendinde' : 'Ödemeler azalış trendinde'
                    },
                    ticketTrend: {
                        direction: ticketTrend > 0 ? 'increasing' : 'decreasing',
                        percentage: Math.abs(ticketTrend).toFixed(2),
                        description: ticketTrend > 0 ?
                            'Talepler artış trendinde' : 'Talepler azalış trendinde'
                    }
                },
                monthlyData: Object.keys(monthlyPayments).map(month => ({
                    month,
                    payments: monthlyPayments[month],
                    tickets: monthlyTickets[month] || 0
                })),
                categoryTrends,
                insights: this._generateInsights(paymentTrend, ticketTrend, categoryTrends)
            };
        } catch (error) {
            console.error('Trend analysis error:', error);
            throw error;
        }
    }

    // Gelişmiş raporlama
    async generateAdvancedReport(startDate, endDate) {
        try {
            const payments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [{ model: User }]
            });

            const tickets = await Ticket.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            });

            // Temel istatistikler
            const totalRevenue = payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            const totalPending = payments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            const totalOverdue = payments
                .filter(p => p.status === 'overdue')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            // Ödeme analizi
            const paymentAnalysis = {
                total: payments.length,
                paid: payments.filter(p => p.status === 'paid').length,
                pending: payments.filter(p => p.status === 'pending').length,
                overdue: payments.filter(p => p.status === 'overdue').length,
                collectionRate: (payments.filter(p => p.status === 'paid').length / payments.length * 100).toFixed(2)
            };

            // Talep analizi
            const ticketAnalysis = {
                total: tickets.length,
                open: tickets.filter(t => t.status === 'open').length,
                inProgress: tickets.filter(t => t.status === 'in_progress').length,
                resolved: tickets.filter(t => t.status === 'resolved').length,
                avgResolutionTime: this._calculateAvgResolutionTime(tickets)
            };

            // Top performers ve issues
            const userPerformance = this._analyzeUserPerformance(payments);

            return {
                period: {
                    start: startDate,
                    end: endDate
                },
                financials: {
                    totalRevenue: Math.round(totalRevenue),
                    totalPending: Math.round(totalPending),
                    totalOverdue: Math.round(totalOverdue),
                    netIncome: Math.round(totalRevenue - totalOverdue)
                },
                paymentAnalysis,
                ticketAnalysis,
                userPerformance,
                recommendations: this._generateRecommendations(paymentAnalysis, ticketAnalysis)
            };
        } catch (error) {
            console.error('Advanced report error:', error);
            throw error;
        }
    }

    // Helper methods
    _groupByType(payments) {
        return payments.reduce((acc, payment) => {
            const type = payment.type || 'other';
            acc[type] = (acc[type] || 0) + parseFloat(payment.amount);
            return acc;
        }, {});
    }

    _groupByMonth(items) {
        return items.reduce((acc, item) => {
            const month = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
    }

    _calculateTrend(values) {
        if (values.length < 2) return 0;
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        return ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    _analyzeCategoryTrends(payments) {
        const byType = this._groupByType(payments);
        return Object.keys(byType).map(type => ({
            category: type,
            total: Math.round(byType[type]),
            percentage: ((byType[type] / Object.values(byType).reduce((a, b) => a + b, 0)) * 100).toFixed(2)
        }));
    }

    _calculateConfidence(values) {
        const variance = values.reduce((acc, val, i, arr) => {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            return acc + Math.pow(val - mean, 2);
        }, 0) / values.length;
        const cv = Math.sqrt(variance) / (values.reduce((a, b) => a + b, 0) / values.length);
        return Math.max(0, Math.min(100, 100 - cv * 100)).toFixed(2);
    }

    _generateInsights(paymentTrend, ticketTrend, categoryTrends) {
        const insights = [];

        if (paymentTrend > 10) {
            insights.push('Ödemeler hızla artıyor, kapasite artırımı değerlendirilebilir.');
        }
        if (ticketTrend > 15) {
            insights.push('Talep sayısı artıyor, teknik ekip desteği artırılmalı.');
        }

        const topCategory = categoryTrends.sort((a, b) => b.total - a.total)[0];
        if (topCategory) {
            insights.push(`En yüksek harcama kategorisi: ${topCategory.category} (%${topCategory.percentage})`);
        }

        return insights;
    }

    _calculateAvgResolutionTime(tickets) {
        const resolved = tickets.filter(t => t.status === 'resolved' && t.resolvedAt);
        if (resolved.length === 0) return 0;

        const totalTime = resolved.reduce((sum, ticket) => {
            const diff = new Date(ticket.resolvedAt) - new Date(ticket.createdAt);
            return sum + diff;
        }, 0);

        return Math.round(totalTime / resolved.length / (1000 * 60 * 60)); // hours
    }

    _analyzeUserPerformance(payments) {
        const userStats = {};

        payments.forEach(payment => {
            const userId = payment.userId;
            if (!userStats[userId]) {
                userStats[userId] = {
                    paid: 0,
                    pending: 0,
                    overdue: 0,
                    total: 0
                };
            }
            userStats[userId][payment.status]++;
            userStats[userId].total++;
        });

        return {
            bestPayers: Object.entries(userStats)
                .sort((a, b) => b[1].paid - a[1].paid)
                .slice(0, 5)
                .map(([userId, stats]) => ({ userId, paid: stats.paid })),
            mostOverdue: Object.entries(userStats)
                .sort((a, b) => b[1].overdue - a[1].overdue)
                .slice(0, 5)
                .map(([userId, stats]) => ({ userId, overdue: stats.overdue }))
        };
    }

    _generateRecommendations(paymentAnalysis, ticketAnalysis) {
        const recommendations = [];

        if (parseFloat(paymentAnalysis.collectionRate) < 80) {
            recommendations.push({
                priority: 'high',
                type: 'payment',
                message: 'Tahsilat oranı düşük. Hatırlatma sistemi aktifleştirilmeli.',
                action: 'enable_payment_reminders'
            });
        }

        if (ticketAnalysis.open > ticketAnalysis.resolved) {
            recommendations.push({
                priority: 'medium',
                type: 'ticket',
                message: 'Açık talep sayısı yüksek. Ekip kapasitesi artırılmalı.',
                action: 'increase_staff'
            });
        }

        if (ticketAnalysis.avgResolutionTime > 72) {
            recommendations.push({
                priority: 'medium',
                type: 'ticket',
                message: 'Ortalama çözüm süresi uzun. Süreç optimizasyonu gerekli.',
                action: 'optimize_workflow'
            });
        }

        return recommendations;
    }

    // AI destekli öneriler (LM Studio / Gemini)
    async getAIInsights(analyticsData) {
            try {
                const prompt = `Site yönetimi için finansal analiz sonuçlarına göre öneriler ver:

Finansal Durum:
- Gelecek ay tahmini: ₺${analyticsData.prediction || 0}
- Son 6 ay ortalama: ₺${analyticsData.average || 0}
- Trend: %${analyticsData.trend || 0}

Bütçe Durumu:
${analyticsData.budgetSuggestions ? analyticsData.budgetSuggestions.map(s => `- ${s.category}: ${s.message}`).join('\n') : 'Veri yok'}

Anomaliler:
${analyticsData.anomalies ? `${analyticsData.anomalies.length} adet anomali tespit edildi` : 'Anomali yok'}

Lütfen kısa ve öz şekilde (maksimum 3-4 madde):
1. Finansal durum değerlendirmesi
2. Acil aksiyonlar
3. Uzun vadeli öneriler
Türkçe olarak yanıtla ve her öneride emoji kullan.`;

            const response = await geminiService.chat(prompt);
            return {
                insights: response.message || response, // message property'sini al, yoksa response'un kendisi
                generatedAt: new Date(),
                source: process.env.USE_LM_STUDIO === 'true' ? 'LM Studio' : 'Gemini AI'
            };
        } catch (error) {
            console.error('AI insights error:', error);
            return {
                insights: '📊 Finansal durum genel olarak dengeli görünüyor.\n💡 Aylık harcamaları düzenli takip edin.\n🎯 Bütçe planlamasını güncel tutun.',
                generatedAt: new Date(),
                source: 'Fallback'
            };
        }
    }
}

module.exports = new AIAnalyticsService();