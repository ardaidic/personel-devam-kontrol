import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const QRCodeGenerator = ({ personel, onClose, open }) => {
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateQR = async () => {
    if (!selectedPersonel) {
      setError('Lütfen personel seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/qr/olustur', {
        personel_id: selectedPersonel
      });
      
      setQrCode(response.data.qr_code);
    } catch (err) {
      setError(err.response?.data?.error || 'QR kod oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrCode('');
    setSelectedPersonel('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">QR Kod Oluştur</Typography>
          <Button onClick={handleClose} startIcon={<CloseIcon />}>
            Kapat
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!qrCode ? (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
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

            <Button
              variant="contained"
              startIcon={<QrCodeIcon />}
              onClick={handleGenerateQR}
              disabled={loading || !selectedPersonel}
              fullWidth
            >
              {loading ? 'QR Kod Oluşturuluyor...' : 'QR Kod Oluştur'}
            </Button>
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              QR Kod Hazır
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <img 
                src={qrCode} 
                alt="QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Paper>
            <Typography variant="body2" color="textSecondary">
              Bu QR kodu personel giriş/çıkış işlemleri için kullanılabilir
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {qrCode && (
          <Button onClick={() => setQrCode('')}>
            Yeni QR Kod
          </Button>
        )}
        <Button onClick={handleClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeGenerator; 