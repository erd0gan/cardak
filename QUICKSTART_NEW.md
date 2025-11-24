[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english)

---

# 🇹🇷 Türkçe

# 🚀 Çardak - Hızlı Başlangıç Rehberi

Bu rehber, Çardak projesini yerel ortamınızda çalıştırmanız için gereken tüm adımları içerir.

**📦 Not:** Bu repo sadece backend API ve mobil APK dosyasını içerir. Admin paneli ve mobil kaynak kodu GitHub'a yüklenmemiştir.

## ✅ Gereksinimler

- **Node.js** v16+ ve npm
- **LM Studio** (AI özelliği için) - [İndir](https://lmstudio.ai/)
- **Git**
- **Android Telefon** (APK yüklemek için)

## 🚀 Kurulum Adımları

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/your-username/emkon-hackathon.git
cd emkon-hackathon
```

### 2. Backend'i Kurun ve Başlatın

```bash
cd cardak-backend
npm install
cp .env.example .env
npm run dev
```

✅ Backend `http://localhost:5000` adresinde çalışacak

**İlk çalıştırmada otomatik oluşturulur:**
- Veritabanı otomatik oluşturulur
- 50 örnek kullanıcı eklenir
- 28 araç ve log kayıtları oluşturulur
- Test verileri hazırlanır

**Çıktı örneği:**
```
🚀 Çardak API running on port 5000
📱 Access from phone: http://<YOUR_IP>:5000
📝 Environment: development
✅ Database connection established successfully.
✅ Already have 48 residents
💰 Seeding dues payments...
✅ Sample announcements created
```

### 3. LM Studio'yu Kurun ve Başlatın

#### Adım 1: LM Studio İndirme

1. [https://lmstudio.ai/](https://lmstudio.ai/) adresine gidin
2. İşletim sisteminize göre indirin:
   - 🪟 Windows
   - 🍎 macOS  
   - 🐧 Linux

#### Adım 2: AI Model İndirme

1. LM Studio'yu açın
2. Sol tarafta **"🔍 Discover"** sekmesine tıklayın
3. Arama çubuğuna model adı yazın

**Önerilen Modeller:**

| Model | Boyut | RAM | Hız | Kalite |
|-------|-------|-----|-----|--------|
| **Gemma 2B** | 2 GB | 4 GB | ⚡⚡⚡ | ⭐⭐ |
| **Phi-3 Mini** | 3 GB | 6 GB | ⚡⚡ | ⭐⭐⭐ |
| **Llama 3.2 3B** | 5 GB | 8 GB | ⚡ | ⭐⭐⭐⭐ |

4. Model yanındaki **"Download"** butonuna tıklayın
5. İndirme tamamlanana kadar bekleyin (3-10 dakika)

#### Adım 3: Local Server Başlatma

1. Sol tarafta **"↔️ Local Server"** sekmesine tıklayın
2. Üstten indirdiğiniz modeli seçin
3. **"Start Server"** butonuna tıklayın
4. Sunucu başladığında yeşil ✅ işareti görünür

**Sunucu adresi:** `http://localhost:1234`

#### Adım 4: Backend ile Bağlantı

`cardak-backend/.env` dosyasını açın ve düzenleyin:

```env
# LM Studio Ayarları
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=gemma-2b-it  # İndirdiğiniz model adı

# Gemini AI (Yedek - Opsiyonel)
GEMINI_API_KEY=  # Boş bırakabilirsiniz
```

**Test Etme:**

Backend terminalinde şunu görmelisiniz:

```bash
curl http://localhost:5000/api/v1/ai-analytics/health
# Response: {"status":"OK","aiService":"lm-studio","connected":true}
```

### 4. APK'yı Telefonunuza Yükleyin

#### Yöntem 1: GitHub Releases'den İndirme

1. [Releases](https://github.com/your-username/emkon-hackathon/releases) sayfasına gidin
2. En son **`cardak-v1.0.0.apk`** dosyasını indirin
3. APK'yı telefona aktarın (WhatsApp, Drive, USB vb.)

#### Yöntem 2: USB ile Doğrudan Yükleme

```bash
# APK dosyasının bulunduğu klasöre gidin
cd cardak-mobile/build/app/outputs/flutter-apk

# Telefonunuzu USB ile bağlayın ve yükleyin
adb install -r app-release.apk
```

#### Telefonda Yükleme:

1. APK dosyasına dokunun
2. **"Bilinmeyen Kaynaklardan Yükleme"** iznini verin
3. **"Yükle"** butonuna tıklayın
4. Uygulama yüklendikten sonra **"Aç"**

### 5. İlk Açılış Ayarı

#### 📡 IP Adresi Yapılandırması

Uygulama ilk açıldığında backend sunucunuzun IP adresini soracak:

1. **IP Adresinizi Bulun:**

```powershell
# Windows
ipconfig | Select-String "IPv4"
# Çıktı: IPv4 Address . . . . : 192.168.1.180

# Mac/Linux
ifconfig | grep "inet "
hostname -I
```

2. **IP Setup Ekranında:**
   - Tam IP adresini girin
   - Örnek: `192.168.1.180`
   - **"Devam Et"** butonuna tıklayın

3. **Giriş Yapın:**
   - Email: `admin@admin.com`
   - Password: `admin123`

**⚠️ Önemli Notlar:**
- Telefon ve bilgisayar **AYNI Wi-Fi ağında** olmalı
- Backend çalışıyor olmalı (`http://your-ip:5000`)
- Windows Firewall port 5000'i engellememelidir

## 🔧 Sorun Giderme

### ❌ Backend'e Bağlanamıyorum

**Kontrol Listesi:**

1. **Backend çalışıyor mu?**
   ```bash
   # Backend klasöründe:
   npm run dev
   ```

2. **IP adresi doğru mu?**
   ```powershell
   # IP'nizi tekrar kontrol edin:
   ipconfig
   ```

3. **Aynı ağda mısınız?**
   - Telefon ve bilgisayar aynı Wi-Fi'de olmalı

4. **Firewall engelliyor mu?**
   ```powershell
   # Windows Firewall'da port 5000'i açın:
   netsh advfirewall firewall add rule name="Cardak Backend" dir=in action=allow protocol=TCP localport=5000
   ```
   ```

5. **Backend'i test edin / Test backend:**
   ```

5. **Backend erişilebilir mi?**
   - Tarayıcıda açın: `http://your-ip:5000/health`
   - Yanıt: `{"status":"OK"}`

### ❌ LM Studio Bağlantı Hatası

1. LM Studio'nun çalıştığından emin olun
2. Local Server'ın başlatıldığını kontrol edin
3. Model yüklenmiş olmalı
4. Port 1234 kullanımda olmamalı

### ❌ APK Yükleme Hatası

1. **"Bilinmeyen Kaynaklardan"** izin verilmiş olmalı
2. Eski sürüm varsa önce kaldırın
3. APK dosyası bozuk olabilir, tekrar indirin

## 🎯 Test Kullanıcıları

### Admin (Tam Yetki)
- Email: `admin@admin.com`
- Password: `admin123`
- **Erişim**: Tüm özellikler

### Manager (Yönetici)
- Email: `manager@manager.com`
- Password: `manager123`
- **Erişim**: Raporlar, onaylar

### Güvenlik Personeli
- Email: `ahmet@cardak.com`
- Password: `password123`
- **Erişim**: Ziyaretçi kontrolü, LPR

### Sakin
- Email: `ayse.yilmaz@email.com`
- Password: `password123`
- **Erişim**: Aidat, rezervasyon, talep

## 📊 Özellik Testleri

### 🤖 AI Chatbot Testi

1. Uygulamada **"AI Asistan"** sekmesine gidin
2. Bir soru yazın: "Aidat ne zaman ödenir?"
3. LM Studio yanıt verecek

### 🚗 Plaka Tanıma Testi

1. Admin olarak giriş yapın
2. **"Plaka Tanıma"** sekmesine gidin
3. **"Giriş Simüle Et"** butonuna tıklayın
4. Araç tanıma logu görünecek

### 🎯 Rezervasyon Testi

1. Sakin olarak giriş yapın
2. **"Rezervasyonlar"** sekmesine gidin
3. Tesis seçin (Spor Salonu)
4. Tarih ve saat seçip kaydedin

## 📞 Yardım

Sorun yaşarsanız:
1. Terminal'deki hata mesajlarını kontrol edin
2. Backend'in çalıştığından emin olun
3. IP adresini doğrulayın
4. Issue açın: [GitHub Issues](https://github.com/your-username/emkon-hackathon/issues)


---

**Başarılar!** 🎉

Proje hakkında sorularınız için GitHub Issues kullanabilirsiniz.

---
---

# 🇬🇧 English

# 🚀 Çardak - Quick Start Guide

This guide contains all the steps needed to run the Çardak project in your local environment.

**📦 Note:** This repository contains only the backend API and mobile APK file. The admin panel and mobile source code are not uploaded to GitHub.

## ✅ Requirements

- **Node.js** v16+ and npm
- **LM Studio** (for AI features) - [Download](https://lmstudio.ai/)
- **Git**
- **Android Phone** (for APK installation)

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/emkon-hackathon.git
cd emkon-hackathon
```

### 2. Setup and Start Backend

```bash
cd cardak-backend
npm install
cp .env.example .env
npm run dev
```

✅ Backend will run at `http://localhost:5000`

**Auto-created on first run:**
- Database created automatically
- 50 sample users added
- 28 vehicles and logs created
- Test data prepared

**Sample output:**
```
🚀 Çardak API running on port 5000
📱 Access from phone: http://<YOUR_IP>:5000
📝 Environment: development
✅ Database connection established successfully.
✅ Already have 48 residents
💰 Seeding dues payments...
✅ Sample announcements created
```

### 3. Install and Start LM Studio

#### Step 1: Download

1. Visit [https://lmstudio.ai/](https://lmstudio.ai/)
2. Download for your OS:
   - 🪟 Windows
   - 🍎 macOS  
   - 🐧 Linux

#### Step 2: Download AI Model

1. Open LM Studio
2. Click on the **"🔍 Discover"** tab on the left
3. Search for a model

**Recommended Models:**

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| **Gemma 2B** | 2 GB | 4 GB | ⚡⚡⚡ | ⭐⭐ |
| **Phi-3 Mini** | 3 GB | 6 GB | ⚡⚡ | ⭐⭐⭐ |
| **Llama 3.2 3B** | 5 GB | 8 GB | ⚡ | ⭐⭐⭐⭐ |

4. Click the **"Download"** button next to the model
5. Wait for download to complete (3-10 minutes)

#### Step 3: Start Local Server

1. Click on the **"↔️ Local Server"** tab on the left
2. Select your downloaded model from the top
3. Click the **"Start Server"** button
4. A green ✅ checkmark appears when server starts

**Server address:** `http://localhost:1234`

#### Step 4: Connect with Backend

Open and edit `cardak-backend/.env` file:

```env
# LM Studio Settings
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=gemma-2b-it  # Your model name

# Gemini AI (Fallback - Optional)
GEMINI_API_KEY=  # Can leave empty
```

**Testing:**

You should see this in backend terminal:

```bash
curl http://localhost:5000/api/v1/ai-analytics/health
# Response: {"status":"OK","aiService":"lm-studio","connected":true}
```

### 4. Install APK on Your Phone

#### Method 1: Download from GitHub Releases

1. Go to the [Releases](https://github.com/your-username/emkon-hackathon/releases) page
2. Download the latest **`cardak-v1.0.0.apk`** file
3. Transfer APK to phone (WhatsApp, Drive, USB, etc.)

#### Method 2: Direct USB Installation

```bash
# Go to APK folder
cd cardak-mobile/build/app/outputs/flutter-apk

# Connect phone via USB and install
adb install -r app-release.apk
```

#### Installation on Phone:

1. Tap the APK file
2. Allow **"Install from Unknown Sources"** permission
3. Click **"Install"** button
4. After installation click **"Open"**

### 5. First Launch Setup

#### 📡 IP Address Configuration

The app will ask for your backend server IP address on first launch:

1. **Find Your IP Address:**

```powershell
# Windows
ipconfig | Select-String "IPv4"
# Output: IPv4 Address . . . . : 192.168.1.180

# Mac/Linux
ifconfig | grep "inet "
hostname -I
```

2. **In IP Setup Screen:**
   - Enter full IP address
   - Example: `192.168.1.180`
   - Click **"Continue"** button

3. **Login:**
   - Email: `admin@admin.com`
   - Password: `admin123`

**⚠️ Important Notes:**
- Phone and computer must be on the **SAME Wi-Fi network**
- Backend must be running (`http://your-ip:5000`)
- Windows Firewall should not block port 5000

## 🔧 Troubleshooting

### ❌ Cannot Connect to Backend

**Checklist:**

1. **Is backend running?**
   ```bash
   # In backend folder:
   npm run dev
   ```

2. **Is IP address correct?**
   ```powershell
   # Check your IP again:
   ipconfig
   ```

3. **Are you on the same network?**
   - Phone and computer must use the same Wi-Fi

4. **Is firewall blocking?**
   ```powershell
   # Open port 5000 in Windows Firewall:
   netsh advfirewall firewall add rule name="Cardak Backend" dir=in action=allow protocol=TCP localport=5000
   ```

5. **Is backend accessible?**
   - Open in browser: `http://your-ip:5000/health`
   - Response: `{"status":"OK"}`

### ❌ LM Studio Connection Error

1. Make sure LM Studio is running
2. Check Local Server is started
3. Model must be loaded
4. Port 1234 should not be in use

### ❌ APK Installation Error

1. **"Unknown Sources"** permission must be granted
2. Uninstall old version first if exists
3. APK file might be corrupted, download again

## 🎯 Test Users

### Admin (Full Access)
- Email: `admin@admin.com`
- Password: `admin123`
- **Access**: All features

### Manager
- Email: `manager@manager.com`
- Password: `manager123`
- **Access**: Reports, approvals

### Security Staff
- Email: `ahmet@cardak.com`
- Password: `password123`
- **Access**: Visitor control, LPR

### Resident
- Email: `ayse.yilmaz@email.com`
- Password: `password123`
- **Access**: Dues, reservations, requests

## 📊 Feature Tests

### 🤖 AI Chatbot Test

1. Go to **"AI Assistant"** tab in the app
2. Ask a question: "When are dues paid?"
3. LM Studio will respond

### 🚗 LPR System Test

1. Login as admin
2. Go to **"License Plate Recognition"** tab
3. Click **"Simulate Entry"** button
4. Vehicle recognition log will appear

### 🎯 Reservation Test

1. Login as resident
2. Go to **"Reservations"** tab
3. Select facility (Gym)
4. Select date/time and save

## 📞 Help

If you face issues:
1. Check terminal error messages
2. Ensure backend is running
3. Verify IP address
4. Open an issue: [GitHub Issues](https://github.com/your-username/emkon-hackathon/issues)

---

**Good Luck!** 🎉

You can use GitHub Issues for questions about the project.
