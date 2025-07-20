import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import axios from 'axios';
import QRCodeGenerator from './QRCodeGenerator';
import QRCodeScanner from './QRCodeScanner';

const DevamKayitlari = () => {
  const [kayitlar, setKayitlar] = useState([]);
  const [personel, setPersonel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [openQRGenerator, setOpenQRGenerator] = useState(false);
  const [openQRScanner, setOpenQRScanner] = useState(false);
  const [filters, setFilters] = useState({
    baslangic: '',
    bitis: '',
    personel_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kayitlarRes, personelRes] = await Promise.all([
        axios.get('/api/devam'),
        axios.get('/api/personel')
      ]);
      setKayitlar(kayitlarRes.data);
      setPersonel(personelRes.data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchKayitlar = async () => {
    try {
      const params = {};
      if (filters.baslangic) params.baslangic = filters.baslangic;
      if (filters.bitis) params.bitis = filters.bitis;
      if (filters.personel_id) params.personel_id = filters.personel_id;

      const response = await axios.get('/api/devam', { params });
      setKayitlar(response.data);
    } catch (err) {
      setError('Kayıtlar yüklenirken hata oluştu');
    }
  };

  const handleGiris = async () => {
    if (!selectedPersonel) {
      setError('Lütfen personel seçin');
      return;
    }

    try {
      await axios.post('/api/devam/giris', { personel_id: selectedPersonel });
      setOpenDialog(false);
      setSelectedPersonel('');
      fetchKayitlar();
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş kaydı başarısız');
    }
  };

  const handleCikis = async (personelId) => {
    try {
      await axios.post('/api/devam/cikis', { personel_id: personelId });
      fetchKayitlar();
    } catch (err) {
      setError(err.response?.data?.error || 'Çıkış kaydı başarısız');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchKayitlar();
  };

  const clearFilters = () => {
    setFilters({
      baslangic: '',
      bitis: '',
      personel_id: ''
    });
    fetchData();
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devam Kayıtları</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setOpenQRGenerator(true)}
          >
            QR Kod Oluştur
          </Button>
          <Button
            variant="outlined"
            startIcon={<QrCodeScannerIcon />}
            onClick={() => setOpenQRScanner(true)}
          >
            QR Kod Tara
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Giriş Kaydı
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filtreler
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={filters.baslangic}
              onChange={(e) => handleFilterChange('baslangic', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={filters.bitis}
              onChange={(e) => handleFilterChange('bitis', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Personel</InputLabel>
              <Select
                value={filters.personel_id}
                label="Personel"
                onChange={(e) => handleFilterChange('personel_id', e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {personel.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.ad} {p.soyad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={applyFilters}>
                Filtrele
              </Button>
              <Button variant="outlined" onClick={clearFilters}>
                Temizle
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Personel</TableCell>
              <TableCell>TC No</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Giriş Zamanı</TableCell>
              <TableCell>Çıkış Zamanı</TableCell>
              <TableCell>Toplam Saat</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kayitlar.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatDate(row.tarih)}</TableCell>
                <TableCell>{`${row.ad} ${row.soyad}`}</TableCell>
                <TableCell>{row.tc_no}</TableCell>
                <TableCell>{row.departman}</TableCell>
                <TableCell>{formatTime(row.giris_zamani)}</TableCell>
                <TableCell>{formatTime(row.cikis_zamani)}</TableCell>
                <TableCell>
                  {row.toplam_calisma_saati 
                    ? `${row.toplam_calisma_saati.toFixed(1)}h`
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.cikis_zamani ? 'Tamamlandı' : 'Devam Ediyor'}
                    color={row.cikis_zamani ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {!row.cikis_zamani && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCikis(row.personel_id)}
                    >
                      Çıkış
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Giriş Kaydı Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Giriş Kaydı Oluştur</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Personel Seçin</InputLabel>
            <Select
              value={selectedPersonel}
              label="Personel Seçin"
              onChange={(e) => setSelectedPersonel(e.target.value)}
            >
              {personel
                .filter(p => p.durum === 'aktif')
                .map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.ad} {p.soyad} - {p.departman}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleGiris} variant="contained">
            Giriş Kaydı Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Kod Bileşenleri */}
      <QRCodeGenerator
        personel={personel}
        open={openQRGenerator}
        onClose={() => setOpenQRGenerator(false)}
      />
      
      <QRCodeScanner
        open={openQRScanner}
        onClose={() => setOpenQRScanner(false)}
        onSuccess={() => {
          fetchData();
          setOpenQRScanner(false);
        }}
      />
    </Box>
  );
};

export default DevamKayitlari; 