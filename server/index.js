const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { pool, initDatabase } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Ana sayfa endpoint'i
app.get('/', (req, res) => {
  res.json({ 
    message: 'Personel Devam Kontrol API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      login: '/api/login',
      personel: '/api/personel',
      devam: '/api/devam',
      qr: '/api/qr',
      maas: '/api/maas'
    }
  });
});

// Veritabanını başlat
initDatabase();

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Giriş
app.post('/api/login', async (req, res) => {
  const { kullanici_adi, sifre } = req.body;

  try {
    const result = await pool.query('SELECT * FROM kullanici WHERE kullanici_adi = $1', [kullanici_adi]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const validPassword = bcrypt.compareSync(sifre, user.sifre);
    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = jwt.sign(
      { id: user.id, kullanici_adi: user.kullanici_adi, rol: user.rol },
      process.env.JWT_SECRET || 'gizli_anahtar',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, kullanici_adi: user.kullanici_adi, rol: user.rol } });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Personel listesi
app.get('/api/personel', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personel ORDER BY ad, soyad');
    res.json(result.rows);
  } catch (error) {
    console.error('Personel listesi hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Personel ekle
app.post('/api/personel', authenticateToken, async (req, res) => {
  const { tc_no, ad, soyad, departman, pozisyon, email, telefon, ise_baslama_tarihi } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO personel (tc_no, ad, soyad, departman, pozisyon, email, telefon, ise_baslama_tarihi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [tc_no, ad, soyad, departman, pozisyon, email, telefon, ise_baslama_tarihi]
    );
    res.json({ id: result.rows[0].id, message: 'Personel başarıyla eklendi' });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Bu TC kimlik numarası zaten kayıtlı' });
    }
    console.error('Personel ekleme hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Personel güncelle
app.put('/api/personel/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { tc_no, ad, soyad, departman, pozisyon, email, telefon, ise_baslama_tarihi, durum } = req.body;

  try {
    const result = await pool.query(
      'UPDATE personel SET tc_no = $1, ad = $2, soyad = $3, departman = $4, pozisyon = $5, email = $6, telefon = $7, ise_baslama_tarihi = $8, durum = $9 WHERE id = $10',
      [tc_no, ad, soyad, departman, pozisyon, email, telefon, ise_baslama_tarihi, durum, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    res.json({ message: 'Personel başarıyla güncellendi' });
  } catch (error) {
    console.error('Personel güncelleme hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Personel sil
app.delete('/api/personel/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM personel WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    res.json({ message: 'Personel başarıyla silindi' });
  } catch (error) {
    console.error('Personel silme hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Giriş kaydı
app.post('/api/devam/giris', authenticateToken, async (req, res) => {
  const { personel_id } = req.body;
  const bugun = moment().format('YYYY-MM-DD');
  const simdi = moment().format('HH:mm:ss');

  try {
    // Bugün için kayıt var mı kontrol et
    const kayitResult = await pool.query(
      'SELECT * FROM devam_kayitlari WHERE personel_id = $1 AND tarih = $2',
      [personel_id, bugun]
    );

    if (kayitResult.rows.length > 0) {
      return res.status(400).json({ error: 'Bugün için zaten giriş kaydı yapılmış' });
    }

    // Yeni giriş kaydı oluştur
    const result = await pool.query(
      'INSERT INTO devam_kayitlari (personel_id, tarih, giris_zamani) VALUES ($1, $2, $3) RETURNING id',
      [personel_id, bugun, simdi]
    );

    res.json({ 
      id: result.rows[0].id, 
      message: 'Giriş kaydı başarıyla oluşturuldu',
      giris_zamani: simdi
    });
  } catch (error) {
    console.error('Giriş kaydı hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Çıkış kaydı
app.post('/api/devam/cikis', authenticateToken, async (req, res) => {
  const { personel_id } = req.body;
  const bugun = moment().format('YYYY-MM-DD');
  const simdi = moment().format('HH:mm:ss');

  try {
    // Bugün için giriş kaydı var mı kontrol et
    const kayitResult = await pool.query(
      'SELECT * FROM devam_kayitlari WHERE personel_id = $1 AND tarih = $2',
      [personel_id, bugun]
    );

    if (kayitResult.rows.length === 0) {
      return res.status(400).json({ error: 'Bugün için giriş kaydı bulunamadı' });
    }

    const kayit = kayitResult.rows[0];

    if (kayit.cikis_zamani) {
      return res.status(400).json({ error: 'Bugün için zaten çıkış kaydı yapılmış' });
    }

    // Çalışma saatini hesapla
    const giris = moment(kayit.giris_zamani, 'HH:mm:ss');
    const cikis = moment(simdi, 'HH:mm:ss');
    const toplam_saat = cikis.diff(giris, 'hours', true);

    // Çıkış kaydını güncelle
    await pool.query(
      'UPDATE devam_kayitlari SET cikis_zamani = $1, toplam_calisma_saati = $2 WHERE id = $3',
      [simdi, toplam_saat, kayit.id]
    );

    res.json({ 
      message: 'Çıkış kaydı başarıyla oluşturuldu',
      cikis_zamani: simdi,
      toplam_calisma_saati: toplam_saat
    });
  } catch (error) {
    console.error('Çıkış kaydı hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Devam kayıtları listesi
app.get('/api/devam', authenticateToken, async (req, res) => {
  const { baslangic, bitis, personel_id } = req.query;
  
  let query = `
    SELECT dk.*, p.ad, p.soyad, p.tc_no, p.departman 
    FROM devam_kayitlari dk 
    JOIN personel p ON dk.personel_id = p.id 
    WHERE 1=1
  `;
  let params = [];
  let paramIndex = 1;

  if (baslangic) {
    query += ` AND dk.tarih >= $${paramIndex}`;
    params.push(baslangic);
    paramIndex++;
  }
  if (bitis) {
    query += ` AND dk.tarih <= $${paramIndex}`;
    params.push(bitis);
    paramIndex++;
  }
  if (personel_id) {
    query += ` AND dk.personel_id = $${paramIndex}`;
    params.push(personel_id);
  }

  query += ' ORDER BY dk.tarih DESC, dk.giris_zamani DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Devam kayıtları hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// İstatistikler
app.get('/api/istatistikler', authenticateToken, async (req, res) => {
  const bugun = moment().format('YYYY-MM-DD');
  const bu_ay = moment().format('YYYY-MM');

  try {
    // Bugün giriş yapan personel sayısı
    const bugunGirisResult = await pool.query(
      'SELECT COUNT(*) as bugun_giris FROM devam_kayitlari WHERE tarih = $1',
      [bugun]
    );

    // Toplam personel sayısı
    const toplamPersonelResult = await pool.query(
      'SELECT COUNT(*) as toplam_personel FROM personel WHERE durum = $1',
      ['aktif']
    );

    // Bu ay toplam çalışma saati
    const aylikSaatResult = await pool.query(
      `SELECT COALESCE(SUM(toplam_calisma_saati), 0) as aylik_toplam_saat 
       FROM devam_kayitlari 
       WHERE tarih LIKE $1 AND toplam_calisma_saati IS NOT NULL`,
      [`${bu_ay}%`]
    );

    res.json({
      bugun_giris: parseInt(bugunGirisResult.rows[0].bugun_giris),
      toplam_personel: parseInt(toplamPersonelResult.rows[0].toplam_personel),
      aylik_toplam_saat: parseFloat(aylikSaatResult.rows[0].aylik_toplam_saat)
    });
  } catch (error) {
    console.error('İstatistikler hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// QR Kod API'leri

// QR kod oluştur
app.post('/api/qr/olustur', authenticateToken, async (req, res) => {
  const { personel_id } = req.body;
  const oturum_id = uuidv4();
  const simdi = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    // Aktif oturum var mı kontrol et
    const oturumResult = await pool.query(
      'SELECT * FROM qr_oturumlari WHERE personel_id = $1 AND aktif = true',
      [personel_id]
    );

    if (oturumResult.rows.length > 0) {
      return res.status(400).json({ error: 'Bu personel için zaten aktif bir QR oturumu var' });
    }

    // Yeni QR oturumu oluştur
    await pool.query(
      'INSERT INTO qr_oturumlari (oturum_id, personel_id, baslangic_zamani) VALUES ($1, $2, $3)',
      [oturum_id, personel_id, simdi]
    );

    // QR kod oluştur
    const qrDataURL = await QRCode.toDataURL(oturum_id);

    res.json({
      oturum_id,
      qr_code: qrDataURL,
      message: 'QR kod başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('QR kod oluşturma hatası:', error);
    res.status(500).json({ error: 'QR kod oluşturulamadı' });
  }
});

// QR kod ile giriş/çıkış
app.post('/api/qr/tarama', authenticateToken, async (req, res) => {
  const { oturum_id } = req.body;
  const simdi = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    // QR oturumunu kontrol et
    const oturumResult = await pool.query(
      'SELECT * FROM qr_oturumlari WHERE oturum_id = $1 AND aktif = true',
      [oturum_id]
    );

    if (oturumResult.rows.length === 0) {
      return res.status(404).json({ error: 'Geçersiz QR kod' });
    }

    const oturum = oturumResult.rows[0];
    const bugun = moment().format('YYYY-MM-DD');
    
    // Bugün için devam kaydı var mı kontrol et
    const kayitResult = await pool.query(
      'SELECT * FROM devam_kayitlari WHERE personel_id = $1 AND tarih = $2',
      [oturum.personel_id, bugun]
    );

    if (kayitResult.rows.length > 0 && kayitResult.rows[0].cikis_zamani) {
      return res.status(400).json({ error: 'Bugün için zaten çıkış yapılmış' });
    }

    if (kayitResult.rows.length > 0) {
      // Çıkış yap
      const kayit = kayitResult.rows[0];
      const giris = moment(kayit.giris_zamani, 'HH:mm:ss');
      const cikis = moment(simdi, 'HH:mm:ss');
      const toplam_saat = cikis.diff(giris, 'hours', true);

      await pool.query(
        'UPDATE devam_kayitlari SET cikis_zamani = $1, toplam_calisma_saati = $2 WHERE id = $3',
        [moment(simdi).format('HH:mm:ss'), toplam_saat, kayit.id]
      );

      // QR oturumunu kapat
      await pool.query(
        'UPDATE qr_oturumlari SET bitis_zamani = $1, aktif = false WHERE oturum_id = $2',
        [simdi, oturum_id]
      );

      res.json({
        message: 'Çıkış başarıyla kaydedildi',
        islem: 'cikis',
        toplam_saat: toplam_saat
      });
    } else {
      // Giriş yap
      await pool.query(
        'INSERT INTO devam_kayitlari (personel_id, tarih, giris_zamani) VALUES ($1, $2, $3)',
        [oturum.personel_id, bugun, moment(simdi).format('HH:mm:ss')]
      );

      res.json({
        message: 'Giriş başarıyla kaydedildi',
        islem: 'giris',
        giris_zamani: moment(simdi).format('HH:mm:ss')
      });
    }
  } catch (error) {
    console.error('QR tarama hatası:', error);
    res.status(500).json({ error: 'QR kod işlenemedi' });
  }
});

// Maaş hesaplama API'leri

// Maaş ayarları ekle/güncelle
app.post('/api/maas-ayarlari', authenticateToken, async (req, res) => {
  const { personel_id, saatlik_ucret, mesai_saati_ucret, gunluk_calisma_saati, aylik_izin_hakki } = req.body;

  try {
    await pool.query(
      `INSERT INTO maas_ayarlari 
       (personel_id, saatlik_ucret, mesai_saati_ucret, gunluk_calisma_saati, aylik_izin_hakki) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (personel_id) 
       DO UPDATE SET 
         saatlik_ucret = EXCLUDED.saatlik_ucret,
         mesai_saati_ucret = EXCLUDED.mesai_saati_ucret,
         gunluk_calisma_saati = EXCLUDED.gunluk_calisma_saati,
         aylik_izin_hakki = EXCLUDED.aylik_izin_hakki`,
      [personel_id, saatlik_ucret, mesai_saati_ucret, gunluk_calisma_saati, aylik_izin_hakki]
    );
    res.json({ message: 'Maaş ayarları başarıyla kaydedildi' });
  } catch (error) {
    console.error('Maaş ayarları hatası:', error);
    res.status(500).json({ error: 'Maaş ayarları kaydedilemedi' });
  }
});

// Maaş ayarlarını getir
app.get('/api/maas-ayarlari/:personel_id', authenticateToken, async (req, res) => {
  const { personel_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM maas_ayarlari WHERE personel_id = $1', [personel_id]);
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Maaş ayarları getirme hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Aylık maaş hesapla
app.get('/api/maas-hesapla/:personel_id', authenticateToken, async (req, res) => {
  const { personel_id } = req.params;
  const { ay, yil } = req.query;
  
  const hedef_ay = ay || moment().format('MM');
  const hedef_yil = yil || moment().format('YYYY');

  try {
    // Maaş ayarlarını al
    const maasAyarlariResult = await pool.query('SELECT * FROM maas_ayarlari WHERE personel_id = $1', [personel_id]);
    
    if (maasAyarlariResult.rows.length === 0) {
      return res.status(404).json({ error: 'Maaş ayarları bulunamadı' });
    }

    const maasAyarlari = maasAyarlariResult.rows[0];

    // Ay içindeki çalışma kayıtlarını al
    const kayitlarResult = await pool.query(
      `SELECT * FROM devam_kayitlari 
       WHERE personel_id = $1 AND tarih LIKE $2 AND toplam_calisma_saati IS NOT NULL`,
      [personel_id, `${hedef_yil}-${hedef_ay}%`]
    );

    const kayitlar = kayitlarResult.rows;
    let toplam_calisma_saati = 0;
    let normal_saat = 0;
    let mesai_saati = 0;
    let calisilan_gun = 0;

    kayitlar.forEach(kayit => {
      const saat = parseFloat(kayit.toplam_calisma_saati);
      toplam_calisma_saati += saat;
      calisilan_gun++;

      if (saat <= maasAyarlari.gunluk_calisma_saati) {
        normal_saat += saat;
      } else {
        normal_saat += maasAyarlari.gunluk_calisma_saati;
        mesai_saati += (saat - maasAyarlari.gunluk_calisma_saati);
      }
    });

    const normal_ucret = normal_saat * maasAyarlari.saatlik_ucret;
    const mesai_ucret = mesai_saati * maasAyarlari.mesai_saati_ucret;
    const toplam_ucret = normal_ucret + mesai_ucret;

    res.json({
      ay: hedef_ay,
      yil: hedef_yil,
      calisilan_gun,
      toplam_calisma_saati: toplam_calisma_saati.toFixed(2),
      normal_saat: normal_saat.toFixed(2),
      mesai_saati: mesai_saati.toFixed(2),
      normal_ucret: normal_ucret.toFixed(2),
      mesai_ucret: mesai_ucret.toFixed(2),
      toplam_ucret: toplam_ucret.toFixed(2),
      saatlik_ucret: maasAyarlari.saatlik_ucret,
      mesai_saati_ucret: maasAyarlari.mesai_saati_ucret
    });
  } catch (error) {
    console.error('Maaş hesaplama hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 