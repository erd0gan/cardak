const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// GEMINI_API_KEY environment variable'dan alınacak
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // LM Studio local server URL (default port: 1234)
        this.lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions';
        this.useLMStudio = process.env.USE_LM_STUDIO === 'true';
    }

    async chat(userMessage, context = {}) {
        // LM Studio kullanımı aktifse
        if (this.useLMStudio) {
            return await this.chatWithLMStudio(userMessage, context);
        }

        // API key yoksa veya demo-key ise direkt fallback kullan
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
            const intent = this.detectIntent(userMessage);
            return {
                message: this.getFallbackResponse(userMessage),
                intent: intent,
                sentiment: this.analyzeSentiment(userMessage)
            };
        }

        try {
            // System prompt - Site yönetim asistanı olarak davranması için
            const systemPrompt = this.getSystemPrompt(context);
            const fullPrompt = `${systemPrompt}\n\nKullanıcı: ${userMessage}\n\nAsistan:`;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            // Intent detection (basit keyword matching)
            const intent = this.detectIntent(userMessage);

            return {
                message: text.trim(),
                intent: intent,
                sentiment: this.analyzeSentiment(userMessage)
            };

        } catch (error) {
            console.error('Gemini API Error:', error);

            // Fallback responses
            return {
                message: this.getFallbackResponse(userMessage),
                intent: this.detectIntent(userMessage),
                sentiment: 'neutral'
            };
        }
    }

    async chatWithLMStudio(userMessage, context = {}) {
        try {
            const systemPrompt = this.getSystemPrompt(context);

            const response = await axios.post(this.lmStudioUrl, {
                model: "local-model", // LM Studio otomatik yüklü modeli kullanır
                messages: [{
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
                stream: false
            }, {
                timeout: 30000 // 30 saniye timeout
            });

            const aiMessage = response.data.choices[0].message.content;
            const intent = this.detectIntent(userMessage);

            return {
                message: aiMessage.trim(),
                intent: intent,
                sentiment: this.analyzeSentiment(userMessage)
            };

        } catch (error) {
            console.error('LM Studio Error:', error.message);

            // LM Studio bağlantı hatası durumunda fallback kullan
            return {
                message: this.getFallbackResponse(userMessage),
                intent: this.detectIntent(userMessage),
                sentiment: 'neutral'
            };
        }
    }

    getSystemPrompt(context = {}) {
        return `Sen Çardak platformunun AI asistanısın. 
Kullanıcılara site yönetimi, aidat ödemeleri, duyurular, arıza bildirimleri ve rezervasyonlar konusunda yardımcı oluyorsun.

Kullanıcı Bilgileri:
- Ad: ${context.userName || 'Sakin'}
- Blok: ${context.buildingBlock || '-'}
- Daire: ${context.apartmentNumber || '-'}

Önemli Kurallar:
1. Kısa ve öz cevaplar ver (maksimum 3-4 cümle)
2. Samimi ve yardımsever ol
3. Türkçe cevap ver
4. Bilmediğin konularda "Yönetim ile iletişime geçmenizi öneririm" de
5. Özel bilgileri (şifreler, kişisel veriler) asla sorma

Yetkili Olduğun Konular:
- Aidat bilgileri ve ödeme durumu
- Site kuralları ve yönetmelikler
- Ortak alan rezervasyonları
- Duyuru ve etkinlikler
- Arıza bildirimi süreci
- Ziyaretçi ve kargo işlemleri
- Genel site bilgileri`;
    }
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('aidat') || lowerMessage.includes('ödeme') || lowerMessage.includes('borç')) {
            return 'payment_query';
        }
        if (lowerMessage.includes('duyuru') || lowerMessage.includes('haber') || lowerMessage.includes('bildirim')) {
            return 'announcement_info';
        }
        if (lowerMessage.includes('arıza') || lowerMessage.includes('tamir') || lowerMessage.includes('sorun') || lowerMessage.includes('bozuk')) {
            return 'ticket_create';
        }
        if (lowerMessage.includes('rezervasyon') || lowerMessage.includes('havuz') || lowerMessage.includes('tenis') || lowerMessage.includes('spor salonu')) {
            return 'reservation_query';
        }
        if (lowerMessage.includes('misafir') || lowerMessage.includes('ziyaretçi') || lowerMessage.includes('konuk')) {
            return 'visitor_query';
        }
        if (lowerMessage.includes('kargo') || lowerMessage.includes('paket') || lowerMessage.includes('teslimat')) {
            return 'parcel_query';
        }
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('hey')) {
            return 'greeting';
        }
        if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol')) {
            return 'thanks';
        }

        return 'general_query';
    }

    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();

        const positiveWords = ['teşekkür', 'harika', 'süper', 'güzel', 'memnun', 'iyi'];
        const negativeWords = ['sorun', 'problem', 'kötü', 'berbat', 'şikayet', 'arıza', 'bozuk'];

        const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
        const hasNegative = negativeWords.some(word => lowerMessage.includes(word));

        if (hasPositive && !hasNegative) return 'positive';
        if (hasNegative && !hasPositive) return 'negative';
        return 'neutral';
    }

    getFallbackResponse(message) {
        const intent = this.detectIntent(message);

        const fallbackResponses = {
            payment_query: 'Aidat ödemelerinizi Ödemeler sekmesinden görüntüleyebilir ve ödeme yapabilirsiniz. Detaylı bilgi için yönetim ile iletişime geçebilirsiniz.',
            announcement_info: 'Güncel duyuruları Duyurular sekmesinden takip edebilirsiniz. Önemli bildirimler size push notification olarak da gönderilir.',
            ticket_create: 'Arıza bildirimi için Talepler sekmesinden yeni talep oluşturabilirsiniz. Ekibimiz en kısa sürede ilgilenecektir.',
            reservation_query: 'Ortak alan rezervasyonları için Rezervasyon sekmesini kullanabilirsiniz. Havuz, tenis kortu ve spor salonu rezerve edilebilir.',
            visitor_query: 'Misafirleriniz için Misafir sekmesinden QR kod oluşturabilirsiniz. Güvenlik bu kod ile misafirinizi içeri alır.',
            parcel_query: 'Kargolarınızı Kargo sekmesinden takip edebilirsiniz. Kargo geldiğinde bildirim alırsınız.',
            greeting: 'Merhaba! Size nasıl yardımcı olabilirim? Aidat, rezervasyon, arıza bildirimi gibi konularda yardımcı olabilirim.',
            thanks: 'Rica ederim! Başka bir konuda yardımcı olabilirsem sormaktan çekinmeyin.',
            general_query: 'Size yardımcı olmak isterim. Aidat, duyurular, arıza bildirimi, rezervasyon veya misafir konularında soru sorabilirsiniz.'
        };

        return fallbackResponses[intent] || fallbackResponses.general_query;
    }
}

module.exports = new GeminiService();