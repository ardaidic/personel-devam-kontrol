const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

// Veritabanı bağlantı ayarları
let pool;

if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
  // Production: PostgreSQL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Development: SQLite
  pool = {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./database.sqlite');
        db.all(sql, params, (err, rows) => {
          db.close();
          if (err) reject(err);
          else resolve({ rows: rows || [] });
        });
      });
    },
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./database.sqlite');
        db.run(sql, params, function(err) {
          db.close();
          if (err) reject(err);
          else resolve({ rowCount: this.changes, lastID: this.lastID });
        });
      });
    }
  };
}

// Veritabanı tablolarını oluştur
const initDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
      // PostgreSQL tabloları
      await pool.query(`
        CREATE TABLE IF NOT EXISTS personel (
          id SERIAL PRIMARY KEY,
          tc_no VARCHAR(11) UNIQUE NOT NULL,
          ad VARCHAR(50) NOT NULL,
          soyad VARCHAR(50) NOT NULL,
          departman VARCHAR(100) NOT NULL,
          pozisyon VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE,
          telefon VARCHAR(20),
          ise_baslama_tarihi DATE NOT NULL,
          durum VARCHAR(20) DEFAULT 'aktif',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS devam_kayitlari (
          id SERIAL PRIMARY KEY,
          personel_id INTEGER NOT NULL,
          tarih DATE NOT NULL,
          giris_zamani TIME,
          cikis_zamani TIME,
          toplam_calisma_saati DECIMAL(5,2),
          durum VARCHAR(20) DEFAULT 'normal',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS kullanici (
          id SERIAL PRIMARY KEY,
          kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
          sifre VARCHAR(255) NOT NULL,
          rol VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS maas_ayarlari (
          id SERIAL PRIMARY KEY,
          personel_id INTEGER NOT NULL,
          saatlik_ucret DECIMAL(10,2) NOT NULL,
          mesai_saati_ucret DECIMAL(10,2) NOT NULL,
          gunluk_calisma_saati DECIMAL(4,2) DEFAULT 8.0,
          aylik_izin_hakki INTEGER DEFAULT 14,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS qr_oturumlari (
          id SERIAL PRIMARY KEY,
          oturum_id VARCHAR(255) UNIQUE NOT NULL,
          personel_id INTEGER NOT NULL,
          baslangic_zamani TIMESTAMP NOT NULL,
          bitis_zamani TIMESTAMP,
          aktif BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);
    } else {
      // SQLite tabloları
      await pool.run(`
        CREATE TABLE IF NOT EXISTS personel (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tc_no TEXT UNIQUE NOT NULL,
          ad TEXT NOT NULL,
          soyad TEXT NOT NULL,
          departman TEXT NOT NULL,
          pozisyon TEXT NOT NULL,
          email TEXT UNIQUE,
          telefon TEXT,
          ise_baslama_tarihi TEXT NOT NULL,
          durum TEXT DEFAULT 'aktif',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.run(`
        CREATE TABLE IF NOT EXISTS devam_kayitlari (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personel_id INTEGER NOT NULL,
          tarih TEXT NOT NULL,
          giris_zamani TEXT,
          cikis_zamani TEXT,
          toplam_calisma_saati REAL,
          durum TEXT DEFAULT 'normal',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);

      await pool.run(`
        CREATE TABLE IF NOT EXISTS kullanici (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kullanici_adi TEXT UNIQUE NOT NULL,
          sifre TEXT NOT NULL,
          rol TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.run(`
        CREATE TABLE IF NOT EXISTS maas_ayarlari (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personel_id INTEGER NOT NULL,
          saatlik_ucret REAL NOT NULL,
          mesai_saati_ucret REAL NOT NULL,
          gunluk_calisma_saati REAL DEFAULT 8.0,
          aylik_izin_hakki INTEGER DEFAULT 14,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);

      await pool.run(`
        CREATE TABLE IF NOT EXISTS qr_oturumlari (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          oturum_id TEXT UNIQUE NOT NULL,
          personel_id INTEGER NOT NULL,
          baslangic_zamani TEXT NOT NULL,
          bitis_zamani TEXT,
          aktif BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (personel_id) REFERENCES personel (id)
        )
      `);
    }

    // Varsayılan admin kullanıcısı oluştur
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
      await pool.query(`
        INSERT INTO kullanici (kullanici_adi, sifre, rol) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (kullanici_adi) DO NOTHING
      `, ['admin', defaultPassword, 'admin']);
    } else {
      await pool.run(`
        INSERT OR IGNORE INTO kullanici (kullanici_adi, sifre, rol) 
        VALUES (?, ?, ?)
      `, ['admin', defaultPassword, 'admin']);
    }

    console.log('Veritabanı tabloları oluşturuldu');
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
  }
};

module.exports = { pool, initDatabase }; 