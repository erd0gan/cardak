const { Vehicle, VehicleLog } = require('../models');
const { Op } = require('sequelize');

class LPRService {
    constructor() {
        // Simülasyon için örnek plakalar
        this.turkishPlatePrefixes = [
            '34', '06', '35', '41', '16', // İstanbul, Ankara, İzmir, Kocaeli, Bursa
            '01', '07', '09', '10', '13', '20', '26', '27', '31', '33', '38', '42', '58'
        ];

        this.plateLetters = 'ABCDEFGHJKLMNPRSTUVYZ'; // I, O, Q, W, X hariç
    }

    // Rastgele Türk plakası üret
    generateRandomPlate() {
        const prefix = this.turkishPlatePrefixes[Math.floor(Math.random() * this.turkishPlatePrefixes.length)];
        const letter1 = this.plateLetters[Math.floor(Math.random() * this.plateLetters.length)];
        const letter2 = this.plateLetters[Math.floor(Math.random() * this.plateLetters.length)];
        const letter3 = Math.random() > 0.5 ? this.plateLetters[Math.floor(Math.random() * this.plateLetters.length)] : '';
        const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

        return `${prefix} ${letter1}${letter2}${letter3} ${number}`;
    }

    // Plaka tanıma simülasyonu
    async simulateRecognition(plateInput = null, eventType = 'entry') {
        try {
            // Plaka verilmediyse rastgele üret veya sistemden birini seç
            let licensePlate;
            if (plateInput) {
                licensePlate = plateInput.toUpperCase();
            } else {
                // %70 ihtimalle kayıtlı araç, %30 ihtimalle random
                if (Math.random() > 0.3) {
                    const vehicles = await Vehicle.findAll({ where: { isActive: true } });
                    if (vehicles.length > 0) {
                        const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
                        licensePlate = randomVehicle.licensePlate;
                    } else {
                        licensePlate = this.generateRandomPlate();
                    }
                } else {
                    licensePlate = this.generateRandomPlate();
                }
            }

            // Plakayı sistemde ara
            const vehicle = await Vehicle.findOne({
                where: { licensePlate }
            });

            let recognitionStatus;
            let confidence;
            let notes = '';

            if (vehicle) {
                recognitionStatus = vehicle.ownerType === 'resident' ? 'recognized' : 'guest';
                confidence = Math.random() * 10 + 90; // 90-100 arası yüksek confidence
                notes = `${vehicle.ownerName} - ${vehicle.blockNumber || ''} ${vehicle.apartmentNumber || ''}`.trim();

                // Araç bilgilerini güncelle
                await vehicle.update({
                    lastSeen: new Date(),
                    entryCount: vehicle.entryCount + 1
                });
            } else {
                recognitionStatus = 'unauthorized';
                confidence = Math.random() * 25 + 65; // 65-90 arası orta confidence
                notes = 'Sistemde kayıt bulunamadı - Yetkisiz giriş';
            }

            // Log kaydı oluştur
            const log = await VehicleLog.create({
                vehicleId: vehicle ? vehicle.id : null,
                licensePlate,
                eventType,
                recognitionStatus,
                confidence: parseFloat(confidence.toFixed(2)),
                cameraId: this.getRandomCamera(),
                location: eventType === 'entry' ? 'Ana Giriş' : 'Ana Çıkış',
                notes
            });

            const result = await VehicleLog.findByPk(log.id, {
                include: [{ model: Vehicle, required: false }]
            });

            return {
                success: true,
                data: result,
                alert: recognitionStatus === 'unauthorized' ? {
                    type: 'warning',
                    message: `⚠️ Yetkisiz araç tespit edildi: ${licensePlate}`,
                    priority: 'high'
                } : null
            };

        } catch (error) {
            console.error('LPR Simulation Error:', error);
            throw error;
        }
    }

    // Toplu simülasyon - test için
    async simulateMultipleRecognitions(count = 10) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const eventType = Math.random() > 0.5 ? 'entry' : 'exit';
            const result = await this.simulateRecognition(null, eventType);
            results.push(result.data);

            // Gerçekçi olmak için kısa delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        }
        return results;
    }

    // Kamera ID'si üret
    getRandomCamera() {
        const cameras = [
            'GATE-CAM-01', // Ana giriş
            'GATE-CAM-02', // Yan giriş
            'GARAGE-CAM-01', // Kapalı otopark
            'GARAGE-CAM-02', // Açık otopark
        ];
        return cameras[Math.floor(Math.random() * cameras.length)];
    }

    // Otopark doluluk analizi
    async getParkingAnalysis() {
        try {
            const totalCapacity = 200;

            // Bugün giriş yapıp çıkış yapmamış araçlar
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Son giriş/çıkış kayıtları
            const recentLogs = await VehicleLog.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            // Her plaka için son işlemi bul
            const plateStatus = new Map();
            recentLogs.forEach(log => {
                if (!plateStatus.has(log.licensePlate)) {
                    plateStatus.set(log.licensePlate, log.eventType);
                }
            });

            // Şu anda içeride olan araç sayısı
            let currentlyInside = 0;
            plateStatus.forEach(status => {
                if (status === 'entry') currentlyInside++;
            });

            const occupancyRate = Math.min((currentlyInside / totalCapacity) * 100, 100);
            const availableSpaces = Math.max(totalCapacity - currentlyInside, 0);

            // Tür bazında dağılım
            const [residentCount, guestCount, unauthorizedCount] = await Promise.all([
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

            return {
                totalCapacity,
                currentlyInside,
                availableSpaces,
                occupancyRate: parseFloat(occupancyRate.toFixed(1)),
                status: occupancyRate > 90 ? 'critical' : occupancyRate > 75 ? 'warning' : 'normal',
                todayStats: {
                    resident: residentCount,
                    guest: guestCount,
                    unauthorized: unauthorizedCount,
                    total: residentCount + guestCount + unauthorizedCount
                }
            };

        } catch (error) {
            console.error('Parking Analysis Error:', error);
            throw error;
        }
    }

    // Gerçek zamanlı simülasyon başlat (dakikada 1-3 araç)
    startRealtimeSimulation(intervalMs = 30000) { // 30 saniye
        console.log('🚗 LPR Real-time simulation started');

        const interval = setInterval(async() => {
            try {
                const shouldSimulate = Math.random() > 0.4; // %60 ihtimal
                if (shouldSimulate) {
                    const result = await this.simulateRecognition();
                    console.log(`🎯 LPR: ${result.data.licensePlate} - ${result.data.recognitionStatus}`);

                    if (result.alert) {
                        console.log(result.alert.message);
                    }
                }
            } catch (error) {
                console.error('Simulation error:', error);
            }
        }, intervalMs);

        return interval;
    }
}

module.exports = new LPRService();