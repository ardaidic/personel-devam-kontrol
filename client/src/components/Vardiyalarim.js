import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Vardiyalarim = () => {
  const [vardiyalar, setVardiyalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAy, setSelectedAy] = useState(new Date().getMonth() + 1);
  const [selectedYil, setSelectedYil] = useState(new Date().getFullYear());
  const { user } = useAuth();

  useEffect(() => {
    fetchVardiyalar();
  }, [fetchVardiyalar]);

  const fetchVardiyalar = useCallback(async () => {
    try {
      const response = await axios.get(`/api/vardiya-planlari/${user.id}?ay=${selectedAy}&yil=${selectedYil}`);
      setVardiyalar(response.data);
    } catch (err) {
      setError('Vardiya planları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user.id, selectedAy, selectedYil]);

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        Vardiyalarım
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Vardiya Tipi</TableCell>
                <TableCell>Günlük Saat</TableCell>
                <TableCell>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vardiyalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Bu ay için vardiya planı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                vardiyalar.map((vardiya) => (
                  <TableRow key={vardiya.id}>
                    <TableCell>{formatTarih(vardiya.tarih)}</TableCell>
                    <TableCell>{vardiya.vardiya_tipi}</TableCell>
                    <TableCell>{vardiya.gunluk_saat} saat</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={vardiya.durum === 'tamamlandi' ? 'success.main' : 'warning.main'}
                      >
                        {vardiya.durum === 'tamamlandi' ? 'Tamamlandı' : 'Planlandı'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {vardiyalar.length} vardiya planlandı
        </Typography>
      </Box>
    </Box>
  );
};

export default Vardiyalarim; 