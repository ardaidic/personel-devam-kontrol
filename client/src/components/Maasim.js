import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Maasim = () => {
  const [maasBilgisi, setMaasBilgisi] = useState(null);
  const [avansBorc, setAvansBorc] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAy, setSelectedAy] = useState(new Date().getMonth() + 1);
  const [selectedYil, setSelectedYil] = useState(new Date().getFullYear());
  const { user } = useAuth();

  useEffect(() => {
    fetchMaasBilgisi();
    fetchAvansBorc();
  }, [selectedAy, selectedYil]);

  const fetchMaasBilgisi = async () => {
    try {
      const response = await axios.get(`/api/maas-hesapla/${user.id}?ay=${selectedAy}&yil=${selectedYil}`);
      setMaasBilgisi(response.data);
    } catch (err) {
      setError('Maaş bilgisi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvansBorc = async () => {
    try {
      const response = await axios.get(`/api/avans-borc/${user.id}`);
      setAvansBorc(response.data);
    } catch (err) {
      console.error('Avans/Borç yüklenirken hata:', err);
    }
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maaşım
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Ay</InputLabel>
          <Select
            value={selectedAy}
            label="Ay"
            onChange={(e) => setSelectedAy(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((ay) => (
              <MenuItem key={ay} value={ay}>
                {ay}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Yıl</InputLabel>
          <Select
            value={selectedYil}
            label="Yıl"
            onChange={(e) => setSelectedYil(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((yil) => (
              <MenuItem key={yil} value={yil}>
                {yil}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {maasBilgisi && (
        <Grid container spacing={3}>
          {/* Maaş Özeti */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Maaş Özeti - {selectedAy}/{selectedYil}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Çalışılan Gün:</Typography>
                <Typography fontWeight="bold">{maasBilgisi.calisilan_gun} gün</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Toplam Çalışma:</Typography>
                <Typography fontWeight="bold">{maasBilgisi.toplam_calisma_saati} saat</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Normal Saat:</Typography>
                <Typography fontWeight="bold">{maasBilgisi.normal_saat} saat</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Mesai Saati:</Typography>
                <Typography fontWeight="bold">{maasBilgisi.mesai_saati} saat</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Maaş Detayı */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Maaş Detayı
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Normal Ücret:</Typography>
                <Typography fontWeight="bold">₺{maasBilgisi.normal_ucret}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Mesai Ücreti:</Typography>
                <Typography fontWeight="bold">₺{maasBilgisi.mesai_ucret}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Brüt Ücret:</Typography>
                <Typography fontWeight="bold" color="primary">₺{maasBilgisi.brüt_ucret}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Toplam Avans:</Typography>
                <Typography fontWeight="bold" color="error">-₺{maasBilgisi.toplam_avans}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Toplam Borç:</Typography>
                <Typography fontWeight="bold" color="warning.main">+₺{maasBilgisi.toplam_borc}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Net Ücret:</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ₺{maasBilgisi.net_ucret}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Avans/Borç Listesi */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Avans/Borç Listesi
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {avansBorc.length === 0 ? (
                <Typography color="text.secondary">Avans/Borç kaydı bulunamadı</Typography>
              ) : (
                avansBorc.slice(0, 5).map((kayit) => (
                  <Box key={kayit.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2">
                        {kayit.tip === 'avans' ? 'Avans' : 'Borç'} - {kayit.aciklama}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(kayit.tarih).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                    <Typography
                      fontWeight="bold"
                      color={kayit.tip === 'avans' ? 'error.main' : 'warning.main'}
                    >
                      {kayit.tip === 'avans' ? '-' : '+'}₺{kayit.miktar}
                    </Typography>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Maasim; 