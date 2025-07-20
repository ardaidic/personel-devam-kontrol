# Personel Devam Kontrol Sistemi

Modern ve kullanıcı dostu personel devam kontrol sistemi. QR kod ile giriş/çıkış, maaş hesaplama ve detaylı raporlama özellikleri.

## 🚀 Özellikler

### 👥 Personel Yönetimi
- Personel ekleme, düzenleme, silme
- TC kimlik numarası ile benzersiz kayıt
- Departman ve pozisyon bilgileri
- Aktif/pasif durum yönetimi

### 📱 QR Kod Sistemi
- Personel için özel QR kod oluşturma
- Kamera ile QR kod tarama
- Otomatik giriş/çıkış kaydı
- Gerçek zamanlı işlem bildirimleri

### 💰 Maaş Hesaplama
- Saatlik ücret ayarları
- Mesai hesaplama
- Aylık maaş raporları
- Detaylı ücret analizi

### 📊 Raporlama
- Günlük devam raporları
- Aylık istatistikler
- Çalışma saati analizi
- Departman bazlı raporlar

## 🛠️ Teknolojiler

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **JWT** - Kimlik doğrulama
- **bcryptjs** - Şifre hashleme
- **QRCode** - QR kod oluşturma

### Frontend
- **React** - UI framework
- **Material-UI** - UI component library
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP client
- **Moment.js** - Tarih işlemleri

## 🌐 Bulut Deployment

### Railway (Backend)
```bash
# Railway CLI ile deployment
railway login
railway init
railway up
```

### Vercel (Frontend)
```bash
# Vercel CLI ile deployment
npm install -g vercel
vercel login
vercel --prod
```

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- Git

### Local Geliştirme

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd personel-devam-kontrol
```

2. **Backend kurulumu**
```bash
cd server
npm install
```

3. **Veritabanı ayarları**
```bash
# .env dosyası oluşturun
cp .env.example .env

# Veritabanı bağlantı bilgilerini girin
DATABASE_URL=postgresql://username:password@localhost:5432/personel_devam_kontrol
JWT_SECRET=your_jwt_secret_key
```

4. **Frontend kurulumu**
```bash
cd ../client
npm install
```

5. **Uygulamayı başlatın**
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm start
```

## 🔧 Ortam Değişkenleri

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_secret_key
PORT=5001
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## 📱 Kullanım

### Admin Girişi
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

### QR Kod İşlemleri
1. **QR Kod Oluştur:** Devam Kayıtları → QR Kod Oluştur
2. **Personel Seç:** QR kod oluşturmak istediğiniz personeli seçin
3. **QR Kod Tara:** Kamera ile QR kodu tarayın
4. **Otomatik Kayıt:** Giriş/çıkış otomatik olarak kaydedilir

### Maaş Hesaplama
1. **Maaş Ayarları:** Personel için saatlik ücret belirleyin
2. **Hesaplama:** Ay ve yıl seçerek maaş hesaplayın
3. **Rapor:** Detaylı maaş raporunu görüntüleyin

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Şifre hashleme (bcrypt)
- CORS koruması
- SQL injection koruması
- Input validation

## 📈 Performans

- PostgreSQL ile hızlı veri erişimi
- React ile responsive UI
- Optimized queries
- Caching strategies

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email:** your-email@example.com
- **Website:** https://your-website.com

## 🙏 Teşekkürler

- Material-UI ekibine
- React ekibine
- PostgreSQL ekibine
- Tüm açık kaynak topluluğuna 