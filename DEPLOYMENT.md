# 🚀 Deployment Rehberi

Bu rehber, Personel Devam Kontrol Sistemini bulutta çalıştırmak için adım adım talimatları içerir.

## 📋 Gereksinimler

- GitHub hesabı
- Railway hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)
- Domain (opsiyonel)

## 🌐 Deployment Adımları

### 1. Backend Deployment (Railway)

#### 1.1 Railway'e Giriş
1. [Railway.app](https://railway.app) adresine gidin
2. GitHub ile giriş yapın
3. "New Project" butonuna tıklayın

#### 1.2 Proje Oluşturma
1. "Deploy from GitHub repo" seçin
2. Repository'nizi seçin
3. "Deploy Now" butonuna tıklayın

#### 1.3 Veritabanı Ekleme
1. Proje sayfasında "New" butonuna tıklayın
2. "Database" → "PostgreSQL" seçin
3. Veritabanı oluşturulduktan sonra "Connect" butonuna tıklayın

#### 1.4 Ortam Değişkenleri
1. "Variables" sekmesine gidin
2. Aşağıdaki değişkenleri ekleyin:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

#### 1.5 Deployment
1. Railway otomatik olarak deployment yapacak
2. "Deployments" sekmesinden durumu takip edin
3. Başarılı olduktan sonra URL'i kopyalayın

### 2. Frontend Deployment (Vercel)

#### 2.1 Vercel'e Giriş
1. [Vercel.com](https://vercel.com) adresine gidin
2. GitHub ile giriş yapın
3. "New Project" butonuna tıklayın

#### 2.2 Proje Oluşturma
1. Repository'nizi seçin
2. Root Directory: `client` olarak ayarlayın
3. Build Command: `npm run build`
4. Output Directory: `build`
5. "Deploy" butonuna tıklayın

#### 2.3 Ortam Değişkenleri
1. Proje ayarlarına gidin
2. "Environment Variables" sekmesine gidin
3. Aşağıdaki değişkeni ekleyin:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

#### 2.4 Yeniden Deployment
1. Ortam değişkeni eklendikten sonra "Redeploy" yapın
2. Deployment tamamlandıktan sonra URL'i kopyalayın

### 3. Domain Ayarları (Opsiyonel)

#### 3.1 Custom Domain Ekleme
1. Vercel proje ayarlarına gidin
2. "Domains" sekmesine gidin
3. Domain'inizi ekleyin
4. DNS ayarlarını yapın

#### 3.2 SSL Sertifikası
- Vercel otomatik olarak SSL sertifikası sağlar
- Railway de otomatik SSL sağlar

## 🔧 Sorun Giderme

### Backend Sorunları

#### Port Hatası
```bash
# Railway otomatik port atar, PORT değişkenini kaldırın
# server/index.js dosyasında:
const PORT = process.env.PORT || 5001;
```

#### Veritabanı Bağlantı Hatası
```bash
# DATABASE_URL'in doğru olduğundan emin olun
# Railway'den kopyaladığınız URL'i kullanın
```

#### CORS Hatası
```bash
# server/index.js dosyasında CORS ayarlarını kontrol edin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Frontend Sorunları

#### API Bağlantı Hatası
```bash
# .env dosyasında REACT_APP_API_URL'in doğru olduğundan emin olun
# Backend URL'inin çalıştığından emin olun
```

#### Build Hatası
```bash
# node_modules'u silin ve yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring

### Railway Monitoring
- Logs: Railway dashboard'da görüntülenir
- Metrics: CPU, Memory kullanımı
- Alerts: Hata durumlarında bildirim

### Vercel Monitoring
- Analytics: Ziyaretçi istatistikleri
- Performance: Sayfa yükleme hızları
- Error Tracking: Hata takibi

## 🔒 Güvenlik

### Production Güvenlik Ayarları
1. **JWT Secret**: Güçlü bir secret key kullanın
2. **CORS**: Sadece gerekli domain'lere izin verin
3. **Rate Limiting**: API rate limiting ekleyin
4. **HTTPS**: SSL sertifikası kullanın

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=very_strong_secret_key
NODE_ENV=production

# Frontend (.env)
REACT_APP_API_URL=https://your-backend.railway.app
```

## 📈 Performans Optimizasyonu

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## 🔄 CI/CD

### GitHub Actions (Opsiyonel)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login
          railway up
```

## 📞 Destek

Deployment sırasında sorun yaşarsanız:

1. **Railway Docs**: https://docs.railway.app
2. **Vercel Docs**: https://vercel.com/docs
3. **GitHub Issues**: Repository'de issue açın

## 🎉 Başarılı Deployment

Deployment tamamlandıktan sonra:

1. ✅ Backend URL'i test edin
2. ✅ Frontend URL'i test edin
3. ✅ Admin girişi yapın
4. ✅ QR kod özelliklerini test edin
5. ✅ Maaş hesaplama özelliklerini test edin

**Tebrikler! Sisteminiz artık bulutta çalışıyor! 🚀** 