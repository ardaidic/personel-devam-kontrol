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
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';

const MaasHesaplama = () => {
  const [personel, setPersonel] = useState([]);
  const [maasAyarlari, setMaasAyarlari] = useState({});
  const [hesaplamaSonucu, setHesaplamaSonucu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAyarlar, setOpenAyarlar] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [selectedAy, setSelectedAy] = useState(new Date().getMonth() + 1);
  const [selectedYil, setSelectedYil] = useState(new Date().getFullYear());
  const [ayarlarForm, setAyarlarForm] = useState({
    saatlik_ucret: '',
    mesai_saati_ucret: '',
    gunluk_calisma_saati: '8',
    aylik_izin_hakki: '14'
  });

  useEffect(() => {
    fetchPersonel();
  }, []);

  const fetchPersonel = async () => {
    try {
      const response = await axios.get('/api/personel');
      setPersonel(response.data);
    } catch (err) {
      setError('Personel listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAyarlarKaydet = async () => {
    if (!selectedPersonel) {
      setError('Lütfen personel seçin');
      return;
    }

    try {
      await axios.post('/api/maas-ayarlari', {
        personel_id: selectedPersonel,
        ...ayarlarForm
      });
      
      setOpenAyarlar(false);
      setError('');
      // Ayarları yeniden yükle
      if (selectedPersonel) {
        fetchMaasAyarlari(selectedPersonel);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ayarlar kaydedilemedi');
    }
  };

  const fetchMaasAyarlari = async (personelId) => {
    try {
      const response = await axios.get(`/api/maas-ayarlari/${personelId}`);
      setMaasAyarlari(response.data);
    } catch (err) {
      console.error('Maaş ayarları yüklenemedi:', err);
    }
  };

  const handlePersonelChange = (personelId) => {
    setSelectedPersonel(personelId);
    if (personelId) {
      fetchMaasAyarlari(personelId);
    }
    setHesaplamaSonucu(null);
  };

  const handleHesapla = async () => {
    if (!selectedPersonel) {
      setError('Lütfen personel seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/maas-hesapla/${selectedPersonel}`, {
        params: {
          ay: selectedAy.toString().padStart(2, '0'),
          yil: selectedYil
        }
      });
      
      setHesaplamaSonucu(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Maaş hesaplanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleAyarlarOpen = () => {
    if (selectedPersonel) {
      setAyarlarForm({
        saatlik_ucret: maasAyarlari.saatlik_ucret || '',
        mesai_saati_ucret: maasAyarlari.mesai_saati_ucret || '',
        gunluk_calisma_saati: maasAyarlari.gunluk_calisma_saati || '8',
        aylik_izin_hakki: maasAyarlari.aylik_izin_hakki || '14'
      });
    }
    setOpenAyarlar(true);
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
        <Typography variant="h4">Maaş Hesaplama</Typography>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={handleAyarlarOpen}
          disabled={!selectedPersonel}
        >
          Maaş Ayarları
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hesaplama Parametreleri
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Personel</InputLabel>
              <Select
                value={selectedPersonel}
                label="Personel"
                onChange={(e) => handlePersonelChange(e.target.value)}
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Ay</InputLabel>
              <Select
                value={selectedAy}
                label="Ay"
                onChange={(e) => setSelectedAy(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((ay) => (
                  <MenuItem key={ay} value={ay}>
                    {new Date(2024, ay - 1).toLocaleDateString('tr-TR', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Yıl"
              type="number"
              value={selectedYil}
              onChange={(e) => setSelectedYil(parseInt(e.target.value))}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={handleHesapla}
              disabled={!selectedPersonel || loading}
              fullWidth
            >
              {loading ? 'Hesaplanıyor...' : 'Maaş Hesapla'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {maasAyarlari.saatlik_ucret && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Maaş Ayarları
              </Typography>
              <Box>
                <Typography variant="body2">
                  <strong>Saatlik Ücret:</strong> {maasAyarlari.saatlik_ucret} ₺
                </Typography>
                <Typography variant="body2">
                  <strong>Mesai Saati Ücreti:</strong> {maasAyarlari.mesai_saati_ucret} ₺
                </Typography>
                <Typography variant="body2">
                  <strong>Günlük Çalışma Saati:</strong> {maasAyarlari.gunluk_calisma_saati} saat
                </Typography>
                <Typography variant="body2">
                  <strong>Aylık İzin Hakkı:</strong> {maasAyarlari.aylik_izin_hakki} gün
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {hesaplamaSonucu && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hesaplama Sonucu - {hesaplamaSonucu.ay}/{hesaplamaSonucu.yil}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Çalışılan Gün
                  </Typography>
                  <Typography variant="h4">
                    {hesaplamaSonucu.calisilan_gun}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Saat
                  </Typography>
                  <Typography variant="h4">
                    {hesaplamaSonucu.toplam_calisma_saati}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Normal Saat
                  </Typography>
                  <Typography variant="h4">
                    {hesaplamaSonucu.normal_saat}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Mesai Saati
                  </Typography>
                  <Typography variant="h4">
                    {hesaplamaSonucu.mesai_saati}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kalem</TableCell>
                    <TableCell align="right">Tutar (₺)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Normal Ücret</TableCell>
                    <TableCell align="right">{hesaplamaSonucu.normal_ucret}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mesai Ücreti</TableCell>
                    <TableCell align="right">{hesaplamaSonucu.mesai_ucret}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Toplam Maaş</strong></TableCell>
                    <TableCell align="right"><strong>{hesaplamaSonucu.toplam_ucret}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {/* Maaş Ayarları Dialog */}
      <Dialog open={openAyarlar} onClose={() => setOpenAyarlar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Maaş Ayarları</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Saatlik Ücret (₺)"
            type="number"
            value={ayarlarForm.saatlik_ucret}
            onChange={(e) => setAyarlarForm({...ayarlarForm, saatlik_ucret: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mesai Saati Ücreti (₺)"
            type="number"
            value={ayarlarForm.mesai_saati_ucret}
            onChange={(e) => setAyarlarForm({...ayarlarForm, mesai_saati_ucret: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Günlük Çalışma Saati"
            type="number"
            value={ayarlarForm.gunluk_calisma_saati}
            onChange={(e) => setAyarlarForm({...ayarlarForm, gunluk_calisma_saati: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Aylık İzin Hakkı (Gün)"
            type="number"
            value={ayarlarForm.aylik_izin_hakki}
            onChange={(e) => setAyarlarForm({...ayarlarForm, aylik_izin_hakki: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAyarlar(false)}>İptal</Button>
          <Button onClick={handleAyarlarKaydet} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaasHesaplama; 