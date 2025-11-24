const { User, Payment, Announcement, Ticket, Vehicle, VehicleLog } = require('../models');
const bcrypt = require('bcryptjs');

const firstNames = [
    'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep', 'Can', 'Elif', 'Mustafa', 'Selin',
    'Emre', 'Deniz', 'Ömer', 'Ebru', 'Burak', 'Merve', 'Serkan', 'Nur', 'Kerem', 'Esra',
    'Murat', 'Gizem', 'Cem', 'Tuğba', 'Hakan', 'Burcu', 'Onur', 'Pınar', 'Tolga', 'Seda',
    'Yusuf', 'Dilek', 'Barış', 'Cansu', 'Furkan', 'Nisa', 'Kaan', 'Melisa', 'Oğuz', 'Ece',
    'Eren', 'Yasemin', 'Berkay', 'Beril', 'Arda', 'Simge', 'Doruk', 'İrem', 'Utku', 'Damla'
];

const lastNames = [
    'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan', 'Koç', 'Kurt',
    'Polat', 'Özkan', 'Erdoğan', 'Güneş', 'Kılıç', 'Başaran', 'Yıldız', 'Aksoy', 'Kaplan', 'Doğan',
    'Tekin', 'Çetin', 'Yüksel', 'Özdemir', 'Türk', 'Acar', 'Korkmaz', 'Aydoğan', 'Yavuz', 'Güler',
    'Keskin', 'Bulut', 'Bayrak', 'Kartal', 'Bozkurt', 'Tunç', 'Güven', 'Akın', 'Erdem', 'Sönmez',
    'Şen', 'Akgül', 'Duman', 'Aslan', 'Uçar', 'Topal', 'Ateş', 'Biçer', 'Engin', 'Kara'
];

// 2 blokluk site: A Blok (1-5 kat, 5 daire), B Blok (1-5 kat, 5 daire) = 50 daire
function generateApartmentNumber(index) {
    const block = index < 25 ? 'A' : 'B';
    const relativeIndex = index % 25;
    const floor = Math.floor(relativeIndex / 5) + 1;
    const doorNumber = (relativeIndex % 5) + 1;
    return `${block}-${floor}0${doorNumber}`;
}

async function seedResidents() {
    try {
        console.log('🌱 Seeding residents...');

        // Admin ve Manager'ı kontrol et
        const adminExists = await User.findOne({ where: { email: 'admin@admin.com' } });
        const managerExists = await User.findOne({ where: { email: 'manager@manager.com' } });

        if (!adminExists) {
            await User.create({
                email: 'admin@admin.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                phone: '5551234567',
                role: 'admin',
                buildingBlock: 'A',
                apartmentNumber: '001',
                isOwner: true,
                isActive: true
            });
            console.log('✅ Admin created');
        }

        if (!managerExists) {
            await User.create({
                email: 'manager@manager.com',
                password: 'admin123',
                firstName: 'Manager',
                lastName: 'User',
                phone: '5557654321',
                role: 'manager',
                buildingBlock: 'B',
                apartmentNumber: '001',
                isOwner: true,
                isActive: true
            });
            console.log('✅ Manager created');
        }

        // Saha personeli kontrolü ve oluşturma
        const staffMembers = [
            { email: 'guvenlik@site.com', firstName: 'Ahmet', lastName: 'Güvenlik', phone: '5559000001', role: 'staff', staffType: 'security' },
            { email: 'teknik@site.com', firstName: 'Mehmet', lastName: 'Teknisyen', phone: '5559000002', role: 'staff', staffType: 'maintenance' },
            { email: 'temizlik@site.com', firstName: 'Ayşe', lastName: 'Temizlikçi', phone: '5559000003', role: 'staff', staffType: 'cleaning' }
        ];

        for (const staff of staffMembers) {
            const exists = await User.findOne({ where: { email: staff.email } });
            if (!exists) {
                await User.create({
                    ...staff,
                    password: 'staff123',
                    buildingBlock: null,
                    apartmentNumber: null,
                    isOwner: false,
                    isActive: true
                });
                console.log(`✅ ${staff.firstName} (${staff.staffType}) created`);
            }
        }

        // Mevcut kullanıcı sayısını kontrol et
        const existingCount = await User.count({ where: { role: 'resident' } });

        if (existingCount >= 48) {
            console.log(`✅ Already have ${existingCount} residents`);
            // Kullanıcılar varsa bile diğer seed fonksiyonlarını çağır
            await seedDuesPayments();
            await seedAnnouncements();
            await seedMarketplaceItems();
            await seedPolls();
            return;
        }

        // 48 sakin oluştur (admin ve manager hariç toplam 50)
        const residentsToCreate = 48 - existingCount;

        for (let i = existingCount; i < existingCount + residentsToCreate; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const apartmentNumber = generateApartmentNumber(i);
            const block = apartmentNumber.charAt(0);

            await User.create({
                email: `sakin${i + 1}@site.com`,
                password: 'sakin123',
                firstName,
                lastName,
                phone: `555${String(i + 1).padStart(7, '0')}`,
                role: 'resident',
                buildingBlock: block,
                apartmentNumber: apartmentNumber,
                isOwner: Math.random() > 0.3, // %70 malik, %30 kiracı
                isActive: true
            });
        }

        console.log(`✅ Created ${residentsToCreate} new residents (Total: 48 residents + 2 admins = 50 users)`);

        // Tüm kullanıcılara son 6 ay için aidat ekle
        await seedDuesPayments();

        // Birkaç örnek duyuru ekle
        await seedAnnouncements();

        // Örnek ticket'lar oluştur
        await seedTickets();

        // Marketplace ilanları oluştur
        await seedMarketplaceItems();

        // Anketler oluştur
        await seedPolls();

    } catch (error) {
        console.error('❌ Seed error:', error.message);
    }
}

async function seedDuesPayments() {
    try {
        console.log('💰 Seeding dues payments...');

        const users = await User.findAll({ where: { role: 'resident' } });
        const MONTHLY_DUES = 1500; // Tüm daireler için sabit aidat

        // Son 9 ay için aidatları oluştur (1-9 arası)
        const now = new Date();
        for (let monthBack = 8; monthBack >= 0; monthBack--) {
            const dueDate = new Date(now.getFullYear(), now.getMonth() - monthBack, 1);
            const period = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;

            for (const user of users) {
                // Bu kullanıcı için bu dönem aidat var mı kontrol et
                const existingPayment = await Payment.findOne({
                    where: {
                        userId: user.id,
                        type: 'dues',
                        description: `${period} Aylık Aidat - ${user.apartmentNumber}`
                    }
                });

                if (!existingPayment) {
                    // Geçmiş aylar için ödeme durumunu belirle
                    const isPaid = monthBack > 2 ? Math.random() > 0.15 : Math.random() > 0.4; // Eski aylar %85 ödenmiş
                    const isOverdue = !isPaid && monthBack > 0;

                    // Her kullanıcı için farklı gün seç (1-28 arası)
                    const randomDay = Math.floor(Math.random() * 27) + 1;
                    const specificDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), randomDay);

                    // Ödeme yapılmışsa, vade tarihinden 1-15 gün sonra rastgele bir tarih
                    let paidDate = null;
                    if (isPaid) {
                        const daysAfterDue = Math.floor(Math.random() * 15) + 1;
                        paidDate = new Date(specificDueDate.getTime() + daysAfterDue * 24 * 60 * 60 * 1000);
                    }

                    await Payment.create({
                        userId: user.id,
                        amount: MONTHLY_DUES,
                        dueDate: specificDueDate,
                        paidAt: paidDate,
                        status: isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending'),
                        type: 'dues',
                        month: period,
                        description: `${period} Aylık Aidat - ${user.apartmentNumber}`
                    });
                }
            }
        }

        console.log('✅ Dues payments created for all residents (last 9 months)');
    } catch (error) {
        console.error('❌ Dues seed error:', error.message);
    }
}

async function seedAnnouncements() {
    try {
        const existingCount = await Announcement.count();

        if (existingCount > 5) {
            console.log('✅ Announcements already exist');
            return;
        }

        // Admin kullanıcısını bul
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.log('⚠️  No admin user found, skipping announcements');
            return;
        }

        const announcements = [{
                createdBy: admin.id,
                title: 'Site Genel Toplantısı',
                content: 'Sayın site sakinleri, 25 Kasım Pazartesi günü saat 19:00\'da site yönetim ofisinde genel kurul toplantısı yapılacaktır. Katılımınızı bekliyoruz.',
                category: 'general',
                priority: 'high',
                isActive: true,
                publishDate: new Date()
            },
            {
                createdBy: admin.id,
                title: 'Yüzme Havuzu Bakım Çalışması',
                content: 'Yüzme havuzumuz 20-22 Kasım tarihleri arasında bakım nedeniyle kapalı olacaktır. Anlayışınız için teşekkür ederiz.',
                category: 'maintenance',
                priority: 'medium',
                isActive: true,
                publishDate: new Date()
            },
            {
                createdBy: admin.id,
                title: 'Yılbaşı Etkinliği',
                content: 'Site sakinleri olarak 31 Aralık\'ta yılbaşı etkinliği düzenliyoruz. Katılım için lütfen yönetimle iletişime geçiniz.',
                category: 'event',
                priority: 'medium',
                isActive: true,
                publishDate: new Date()
            },
            {
                createdBy: admin.id,
                title: 'Elektrik Kesintisi',
                content: 'Yarın saat 10:00-12:00 arasında planlı elektrik kesintisi olacaktır. Lütfen elektronik cihazlarınızı kapatınız.',
                category: 'urgent',
                priority: 'high',
                isActive: true,
                publishDate: new Date()
            },
            {
                createdBy: admin.id,
                title: 'Kış Lastiği Uyarısı',
                content: 'Sayın araç sahipleri, lütfen araçlarınızın kış lastiği takılı olduğundan emin olunuz.',
                category: 'general',
                priority: 'low',
                isActive: true,
                publishDate: new Date()
            }
        ];

        for (const announcement of announcements) {
            await Announcement.create(announcement);
        }

        console.log('✅ Sample announcements created');
    } catch (error) {
        console.error('❌ Announcement seed error:', error.message);
    }
}

async function seedTickets() {
    try {
        const existingCount = await Ticket.count();

        if (existingCount > 10) {
            console.log('✅ Tickets already exist');
            return;
        }

        const residents = await User.findAll({ where: { role: 'resident' }, limit: 10 });
        if (residents.length === 0) {
            console.log('⚠️  No residents found, skipping tickets');
            return;
        }

        const ticketTemplates = [{
                category: 'maintenance',
                title: 'Asansör Arızası',
                description: 'A blok asansörü çalışmıyor, lütfen kontrol edilsin.',
                location: 'A Blok Asansör',
                priority: 'high',
            },
            {
                category: 'plumbing',
                title: 'Su Sızıntısı',
                description: 'Banyoda lavabonun altından su sızıntısı var.',
                location: 'Daire İçi',
                priority: 'high',
            },
            {
                category: 'electrical',
                title: 'Elektrik Kesintisi',
                description: 'Dairemde elektrik sürekli kesiliyor, sigorta atıyor.',
                location: 'Daire İçi',
                priority: 'medium',
            },
            {
                category: 'cleaning',
                title: 'Ortak Alan Temizliği',
                description: 'Site girişindeki çöpler toplanmamış.',
                location: 'Site Girişi',
                priority: 'low',
            },
            {
                category: 'security',
                title: 'Güvenlik Kamerası',
                description: 'Otopark girişindeki kamera çalışmıyor.',
                location: 'Otopark',
                priority: 'medium',
            },
            {
                category: 'garden',
                title: 'Bahçe Bakımı',
                description: 'Bahçedeki otlar uzamış, budama yapılması gerekiyor.',
                location: 'Site Bahçesi',
                priority: 'low',
            },
            {
                category: 'noise',
                title: 'Gürültü Şikayeti',
                description: 'Üst komşudan gece geç saatlerde yüksek sesle müzik.',
                location: 'Daire İçi',
                priority: 'medium',
            },
            {
                category: 'heating',
                title: 'Kalorifer Sorunu',
                description: 'Dairemizde kalorifer ısınmıyor.',
                location: 'Daire İçi',
                priority: 'high',
            },
            {
                category: 'parking',
                title: 'Park Yeri İhlali',
                description: 'Misafir araç park yerime park etmiş.',
                location: 'Otopark',
                priority: 'low',
            },
            {
                category: 'other',
                title: 'Posta Kutusu Arızası',
                description: 'Posta kutusu kilidi bozuk, açılmıyor.',
                location: 'Giriş Holü',
                priority: 'low',
            },
        ];

        const statuses = ['open', 'open', 'open', 'in-progress', 'in-progress', 'resolved', 'resolved', 'closed'];

        for (let i = 0; i < Math.min(residents.length, ticketTemplates.length); i++) {
            const resident = residents[i];
            const template = ticketTemplates[i];
            const status = statuses[i % statuses.length];

            const createdAt = new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000); // Son 10 gün

            await Ticket.create({
                userId: resident.id,
                category: template.category,
                title: template.title,
                description: template.description,
                location: template.location,
                priority: template.priority,
                status: status,
                createdAt: createdAt,
                updatedAt: createdAt,
            });
        }

        console.log('✅ Sample tickets created');
    } catch (error) {
        console.error('❌ Ticket seed error:', error.message);
    }
}

async function seedMarketplaceItems() {
    try {
        const { MarketplaceItem } = require('../models');
        const existingCount = await MarketplaceItem.count();

        if (existingCount > 10) {
            console.log('✅ Marketplace items already exist');
            return;
        }

        const residents = await User.findAll({ where: { role: 'resident' }, limit: 15 });
        if (residents.length === 0) {
            console.log('⚠️  No residents found, skipping marketplace items');
            return;
        }

        const items = [{
                title: 'Çocuk Bisikleti',
                description: 'Temiz durumda, 5-8 yaş arası çocuklar için ideal. Kullanılmıyor, hediye edilebilir.',
                category: 'sports',
                price: null,
                status: 'active',
                tags: ['ücretsiz', 'çocuk', 'bisiklet']
            },
            {
                title: 'Laptop Masası',
                description: 'Ayarlanabilir yüksekliğe sahip laptop masası. Çok az kullanıldı.',
                category: 'furniture',
                price: 250,
                status: 'active',
                tags: ['mobilya', 'masa', 'laptop']
            },
            {
                title: 'Bebek Arabası',
                description: 'Marka bebek arabası, yeni gibi. 800 TL\'ye alındı.',
                category: 'baby',
                price: 400,
                status: 'active',
                tags: ['bebek', 'araba', 'temiz']
            },
            {
                title: 'Elektrikli Süpürge',
                description: 'Philips marka, çalışır durumda. Yeni model aldım.',
                category: 'electronics',
                price: 150,
                status: 'active',
                tags: ['elektronik', 'temizlik']
            },
            {
                title: 'Kitap Seti - Roman',
                description: '20 adet klasik ve modern roman. Ödünç veya hediye edilebilir.',
                category: 'books',
                price: null,
                status: 'active',
                tags: ['kitap', 'roman', 'ödünç']
            },
            {
                title: 'Bahçe Mobilyası Seti',
                description: 'Masa + 4 sandalye, plastik bahçe mobilyası. Hâlâ sağlam.',
                category: 'furniture',
                price: 300,
                status: 'active',
                tags: ['bahçe', 'mobilya', 'set']
            },
            {
                title: 'Oyuncak Araba Seti',
                description: 'Çocuğum büyüdü, 50\'den fazla oyuncak araba var.',
                category: 'toys',
                price: null,
                status: 'active',
                tags: ['oyuncak', 'çocuk', 'ücretsiz']
            },
            {
                title: 'Mikrodalga Fırın',
                description: 'Samsung marka, 1 yıl kullanıldı. Çalışır durumda.',
                category: 'electronics',
                price: 500,
                status: 'active',
                tags: ['elektronik', 'mutfak']
            },
            {
                title: 'Spor Aleti Seti',
                description: 'Dambıl seti, yoga matı ve resistance band. Az kullanıldı.',
                category: 'sports',
                price: 200,
                status: 'active',
                tags: ['spor', 'sağlık', 'fitness']
            },
            {
                title: 'Kışlık Kıyafetler',
                description: '10-12 yaş kız çocuğu kışlık kıyafetleri. Temiz, kullanılabilir.',
                category: 'clothing',
                price: null,
                status: 'active',
                tags: ['kıyafet', 'çocuk', 'ücretsiz']
            },
            {
                title: 'Ofis Sandalyesi',
                description: 'Ergonomik ofis sandalyesi, siyah renk. Home office için ideal.',
                category: 'furniture',
                price: 350,
                status: 'active',
                tags: ['mobilya', 'ofis', 'sandalye']
            },
            {
                title: 'Akvaryum Seti',
                description: '50 litrelik akvaryum + filtre + ışık. Taşınıyorum, satıyorum.',
                category: 'pets',
                price: 400,
                status: 'active',
                tags: ['akvaryum', 'balık', 'evcil hayvan']
            },
            {
                title: 'Piknik Sepeti',
                description: '4 kişilik piknik sepeti, tüm ekipmanlarıyla. Ödünç verilebilir.',
                category: 'other',
                price: null,
                status: 'active',
                tags: ['piknik', 'ödünç', 'outdoor']
            },
            {
                title: 'Elektrikli Çim Biçme Makinesi',
                description: 'Bosch marka, az kullanıldı. Yeni eve taşınıyorum.',
                category: 'garden',
                price: 800,
                status: 'active',
                tags: ['bahçe', 'çim', 'makine']
            },
            {
                title: 'Mutfak Gereçleri',
                description: 'Tencere, tava, bardak takımı vs. Fazla eşyalarımı veriyorum.',
                category: 'kitchen',
                price: null,
                status: 'active',
                tags: ['mutfak', 'ücretsiz', 'set']
            }
        ];

        for (let i = 0; i < Math.min(residents.length, items.length); i++) {
            const resident = residents[i];
            const item = items[i];

            await MarketplaceItem.create({
                userId: resident.id,
                ...item,
                isActive: true
            });
        }

        console.log('✅ Marketplace items created');
    } catch (error) {
        console.error('❌ Marketplace seed error:', error.message);
    }
}

async function seedPolls() {
    try {
        const { Poll } = require('../models');
        const existingCount = await Poll.count();

        if (existingCount > 5) {
            console.log('✅ Polls already exist');
            return;
        }

        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.log('⚠️  No admin found, skipping polls');
            return;
        }

        const now = new Date();
        const polls = [{
                createdBy: admin.id,
                title: 'Yeni Yıl Kutlaması Organizasyonu',
                description: 'Site olarak yılbaşı gecesi ortak alan kullanımı için oylama yapıyoruz.',
                options: [
                    { id: '1', text: 'Organizasyon yapılsın', votes: 0 },
                    { id: '2', text: 'Organizasyon yapılmasın', votes: 0 }
                ],
                allowMultipleVotes: false,
                isAnonymous: false,
                startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            },
            {
                createdBy: admin.id,
                title: 'Ortak Alan Aktiviteleri',
                description: 'Hangi sosyal aktiviteleri düzenleyelim? (Çoklu seçim yapabilirsiniz)',
                options: [
                    { id: '1', text: 'Yoga dersleri', votes: 0 },
                    { id: '2', text: 'Çocuk etkinlikleri', votes: 0 },
                    { id: '3', text: 'Film geceleri', votes: 0 },
                    { id: '4', text: 'Kahvaltı organizasyonları', votes: 0 }
                ],
                allowMultipleVotes: true,
                isAnonymous: false,
                startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            },
            {
                createdBy: admin.id,
                title: 'Evcil Hayvan Park Alanı',
                description: 'Sitede evcil hayvanlar için özel park alanı yapılsın mı?',
                options: [
                    { id: '1', text: 'Evet, yapılsın', votes: 0 },
                    { id: '2', text: 'Hayır, gerek yok', votes: 0 },
                    { id: '3', text: 'Kararsızım', votes: 0 }
                ],
                allowMultipleVotes: false,
                isAnonymous: true,
                startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            },
            {
                createdBy: admin.id,
                title: 'Güvenlik Kamera Sistemi Yenileme',
                description: 'Güvenlik kamera sisteminin yenilenmesi için ekstra ödeme yapılmasını onaylıyor musunuz?',
                options: [
                    { id: '1', text: 'Evet, yenilensin (150 TL/ay ek aidat)', votes: 0 },
                    { id: '2', text: 'Hayır, mevcut sistem yeterli', votes: 0 }
                ],
                allowMultipleVotes: false,
                isAnonymous: false,
                startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            },
            {
                createdBy: admin.id,
                title: 'Açık Hava Spor Aletleri',
                description: 'Bahçeye hangi spor aletleri konulsun?',
                options: [
                    { id: '1', text: 'Koşu bandı ve bisiklet', votes: 0 },
                    { id: '2', text: 'Barfiks ve paralel bar', votes: 0 },
                    { id: '3', text: 'Basketbol potası', votes: 0 },
                    { id: '4', text: 'Masa tenisi masası', votes: 0 }
                ],
                allowMultipleVotes: true,
                isAnonymous: false,
                startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            },
            {
                createdBy: admin.id,
                title: 'Yaz Dönemi Havuz Saatleri',
                description: 'Havuz hangi saatler arasında açık olsun?',
                options: [
                    { id: '1', text: '08:00 - 20:00', votes: 0 },
                    { id: '2', text: '09:00 - 21:00', votes: 0 },
                    { id: '3', text: '07:00 - 22:00', votes: 0 }
                ],
                allowMultipleVotes: false,
                isAnonymous: false,
                startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
                status: 'active',
                targetAudience: 'all'
            }
        ];

        for (const poll of polls) {
            await Poll.create(poll);
        }

        console.log('✅ Polls created');
    } catch (error) {
        console.error('❌ Poll seed error:', error.message);
    }

    // Seed Vehicles
    try {
        const vehicleCount = await Vehicle.count();
        if (vehicleCount === 0) {
            console.log('🚗 Seeding vehicles...');

            const residents = await User.findAll({
                where: { role: 'resident' },
                limit: 20
            });

            const turkishPlatePrefixes = ['34', '06', '35', '41', '16', '01', '07', '09'];
            const plateLetters = 'ABCDEFGHJKLMNPRSTUVYZ';
            const vehicleTypes = ['car', 'car', 'car', 'motorcycle', 'van'];
            const brands = ['Toyota', 'Renault', 'Ford', 'Volkswagen', 'Hyundai', 'Honda', 'BMW', 'Mercedes'];
            const colors = ['Beyaz', 'Siyah', 'Gri', 'Mavi', 'Kırmızı'];

            const vehicles = [];

            // Sakin araçları
            for (let i = 0; i < residents.length; i++) {
                const resident = residents[i];
                const prefix = turkishPlatePrefixes[i % turkishPlatePrefixes.length];
                const letter1 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const letter2 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const number = Math.floor(Math.random() * 9000) + 1000;

                vehicles.push({
                    licensePlate: `${prefix} ${letter1}${letter2} ${number}`,
                    ownerName: `${resident.firstName} ${resident.lastName}`,
                    ownerType: 'resident',
                    blockNumber: resident.buildingBlock,
                    apartmentNumber: resident.apartmentNumber,
                    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
                    brand: brands[Math.floor(Math.random() * brands.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    phone: resident.phone,
                    isActive: true,
                    entryCount: Math.floor(Math.random() * 50) + 10,
                    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                });
            }

            // Misafir araçları
            const guestNames = ['Kemal Aydın', 'Selin Yılmaz', 'Cem Polat', 'Aylin Kaya', 'Mert Demir'];
            for (let i = 0; i < 5; i++) {
                const prefix = turkishPlatePrefixes[Math.floor(Math.random() * turkishPlatePrefixes.length)];
                const letter1 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const letter2 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const number = Math.floor(Math.random() * 9000) + 1000;

                vehicles.push({
                    licensePlate: `${prefix} ${letter1}${letter2} ${number}`,
                    ownerName: guestNames[i],
                    ownerType: 'guest',
                    vehicleType: 'car',
                    brand: brands[Math.floor(Math.random() * brands.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    phone: `555${Math.floor(Math.random() * 9000000) + 1000000}`,
                    isActive: true,
                    entryCount: Math.floor(Math.random() * 10) + 1,
                    lastSeen: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
                });
            }

            // Yetkisiz araçlar
            for (let i = 0; i < 3; i++) {
                const prefix = turkishPlatePrefixes[Math.floor(Math.random() * turkishPlatePrefixes.length)];
                const letter1 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const letter2 = plateLetters[Math.floor(Math.random() * plateLetters.length)];
                const number = Math.floor(Math.random() * 9000) + 1000;

                vehicles.push({
                    licensePlate: `${prefix} ${letter1}${letter2} ${number}`,
                    ownerName: 'Bilinmeyen',
                    ownerType: 'unauthorized',
                    vehicleType: 'car',
                    isActive: false,
                    entryCount: 1,
                    lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    notes: 'Güvenlik tarafından kaydedildi'
                });
            }

            await Vehicle.bulkCreate(vehicles);
            console.log(`✅ ${vehicles.length} vehicles created`);

            // Vehicle logs oluştur
            console.log('📝 Seeding vehicle logs...');
            const createdVehicles = await Vehicle.findAll();
            const logs = [];

            for (const vehicle of createdVehicles) {
                const logCount = Math.min(vehicle.entryCount, 10);
                for (let i = 0; i < logCount; i++) {
                    const eventType = i % 2 === 0 ? 'entry' : 'exit';
                    const daysAgo = Math.floor(Math.random() * 30);

                    logs.push({
                        vehicleId: vehicle.id,
                        licensePlate: vehicle.licensePlate,
                        eventType,
                        recognitionStatus: vehicle.ownerType === 'resident' ? 'recognized' : vehicle.ownerType === 'guest' ? 'guest' : 'unauthorized',
                        confidence: vehicle.ownerType === 'resident' ?
                            (Math.random() * 10 + 90) :
                            (Math.random() * 20 + 70),
                        cameraId: ['GATE-CAM-01', 'GATE-CAM-02', 'GARAGE-CAM-01'][Math.floor(Math.random() * 3)],
                        location: eventType === 'entry' ? 'Ana Giriş' : 'Ana Çıkış',
                        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                        notes: vehicle.ownerType === 'resident' ?
                            `${vehicle.ownerName} - ${vehicle.blockNumber} ${vehicle.apartmentNumber}` : vehicle.notes || ''
                    });
                }
            }

            await VehicleLog.bulkCreate(logs);
            console.log(`✅ ${vehicles.length} vehicles created`);
        } else {
            console.log('✅ Vehicles already exist');
        }
    } catch (error) {
        console.error('❌ Vehicle seed error:', error.message);
        console.error('Full error:', error);
        if (error.errors) {
            error.errors.forEach(err => console.error('  -', err.message));
        }
    }
}

module.exports = { seedResidents };