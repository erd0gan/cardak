# Çardak - Hızlı Başlangıç Rehberi

Bu rehber, Çardak projesini yerel ortamınızda çalıştırmanız için gereken tüm adımları içerir.

## ✅ Gereksinimler

- **Node.js** v16+ ve npm
- **Flutter** SDK v3.0+
- **Android Studio** veya **Xcode** (mobil geliştirme için)
- **Git**

## 🚀 Kurulum Adımları

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/your-username/emkon-hackathon.git
cd emkon-hackathon
```

### 2. Backend'i Başlatın

```bash
cd cardak-backend
npm install
cp .env.example .env
npm run dev
```

✅ Backend `http://localhost:5000` adresinde çalışacak

**İlk çalıştırmada:**
- Veritabanı otomatik oluşturulur
- 50 örnek kullanıcı eklenir
- 28 araç ve log kayıtları oluşturulur
- Test verileri hazırlanır

### 3. Web Admin'i Başlatın (Opsiyonel)

```bash
cd cardak-admin
npm install
npm run dev
```

✅ Admin panel `http://localhost:5173` adresinde çalışacak

**Login:**
- Email: `admin@admin.com`
- Password: `admin123`

### 4. Mobil Uygulamayı Çalıştırın

```bash
cd cardak-mobile
flutter pub get
flutter run
```

**İlk açılış:**
1. Uygulama IP adresi soracak
2. Bilgisayarınızın IP'sini girin (örn: 192.168.1.180)
3. "Devam Et" butonuna tıklayın
4. Login ekranında giriş yapın

**IP Bulma:**
```powershell
# Windows
ipconfig | Select-String "IPv4"

# Mac/Linux
ifconfig | grep "inet "
```

**Login:**
- Email: `admin@admin.com` veya `ayse.yilmaz@email.com`
- Password: `admin123` veya `password123`

## 📱 APK Oluşturma

Release APK için:

```bash
cd cardak-mobile
flutter build apk --release
```

APK dosyası: `build/app/outputs/flutter-apk/app-release.apk`

## 🔧 Sorun Giderme

### Backend bağlantı hatası
- Backend'in çalıştığından emin olun (`http://localhost:5000/health`)
- IP adresinin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### Flutter bağımlılık hatası
```bash
flutter clean
flutter pub get
```

### Hot reload çalışmıyor
Terminal'de `R` tuşuna basarak hot restart yapın

## 🎯 Test Kullanıcıları

### Admin
- Email: `admin@admin.com`
- Password: `admin123`
- Rol: Tam yetki

### Manager
- Email: `manager@manager.com`
- Password: `manager123`
- Rol: Yönetici yetkisi

### Güvenlik Görevlisi
- Email: `ahmet@cardak.com`
- Password: `password123`
- Rol: Personel

### Sakin
- Email: `ayse.yilmaz@email.com`
- Password: `password123`
- Rol: Site sakini

## 📊 Özellik Testleri

### AI Analytics
1. Admin olarak giriş yapın
2. Dashboard'da "Yapay Zeka Analiz" kartına tıklayın
3. AI önerilerini görüntüleyin

### LPR Sistemi
1. Admin olarak giriş yapın
2. "Plaka Tanıma" sekmesine gidin
3. "Giriş Simüle Et" veya "Otomatik" butonuna tıklayın
4. Araç tanıma loglarını görüntüleyin

### Rezervasyon
1. Sakin olarak giriş yapın
2. "Rezervasyonlar" sekmesine gidin
3. Bir tesis seçin (Spor Salonu, Havuz, vb.)
4. Tarih ve saat seçip rezervasyon oluşturun

## 🌐 Network Konfigürasyonu

### Fiziksel Android Cihazda Test

1. **Backend'i network'e aç:**
   - Backend zaten `0.0.0.0` üzerinde dinliyor
   - Port 5000 açık olmalı

2. **IP adresini bulun:**
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}
   ```

3. **APK'yı yükleyin:**
   ```bash
   flutter build apk --release
   adb install -r build/app/outputs/flutter-apk/app-release.apk
   ```

4. **Uygulamada IP'yi girin:**
   - İlk açılışta IP setup ekranı gelecek
   - Bilgisayarınızın IP'sini girin (örn: 192.168.1.180)

## 📝 Geliştirme Notları

- Backend değişikliklerinde otomatik restart (nodemon)
- Flutter hot reload ile anında UI güncellemeleri
- Debug logları sadece development modunda
- SQLite veritabanı `cardak-backend/database.sqlite`

## 🎨 Ekran Görüntüleri

Proje çalıştıktan sonra şu ekranları görebilirsiniz:
- 🏠 Dashboard (istatistikler, hızlı erişim)
- 💰 Ödemeler (aidat takibi)
- 🚗 Araç Yönetimi (LPR sistemi)
- 📢 Duyurular
- 🛠️ Talep & Arıza
- 🎯 Rezervasyonlar

## 📞 Yardım

Sorun yaşarsanız:
1. Terminal'deki hata mesajlarını kontrol edin
2. Backend'in çalıştığından emin olun
3. IP adresini doğrulayın
4. Issue açın: GitHub Issues

---

Başarılar! 🎉
